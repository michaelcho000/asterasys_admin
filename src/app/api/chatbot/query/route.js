import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPT, buildDynamicContext } from '@/lib/chatbot/systemPrompt'
import { buildChatbotContext } from '@/lib/chatbot/dataContextBuilder'

// Anthropic 클라이언트 초기화
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

/**
 * POST /api/chatbot/query
 * 챗봇 질의응답 API - Claude Sonnet 4.5
 */
export async function POST(request) {
  try {
    const { message, history = [], month = '2025-09' } = await request.json()

    // 입력 검증
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message' },
        { status: 400 }
      )
    }

    // 데이터 컨텍스트 구성
    console.log(`[Chatbot] Building context for query: "${message}"`)
    const contextData = await buildChatbotContext(message, month)

    // 대화 히스토리 변환 (최근 10개만)
    const conversationHistory = history.slice(-10).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }))

    // 시스템 프롬프트 + 데이터 컨텍스트
    const systemPrompt = SYSTEM_PROMPT + '\n\n' + contextData.formatted

    console.log('[Chatbot] Calling Claude API with streaming...')

    // Claude API 스트리밍 호출 (Web Search Tool 포함)
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1500,
      temperature: 0.3,
      system: systemPrompt,
      messages: [
        ...conversationHistory,
        {
          role: 'user',
          content: message
        }
      ],
      tools: [
        {
          name: 'web_search',
          type: 'web_search_20250305'
        }
      ]
    })

    // ReadableStream 생성
    const encoder = new TextEncoder()
    let fullResponse = ''
    let webSearchResults = []
    let pageLink = null

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            // 텍스트 델타 처리
            if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
              const text = chunk.delta.text
              fullResponse += text

              // 클라이언트로 텍스트 청크 전송
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'text', content: text })}\n\n`)
              )
            }

            // Tool use 처리
            if (chunk.type === 'content_block_start' && chunk.content_block?.type === 'tool_use') {
              if (chunk.content_block.name === 'web_search') {
                webSearchResults.push({
                  query: chunk.content_block.input?.query || '',
                  results: []
                })
              }
            }
          }

          // 페이지 링크 추출
          const pageLinkMatch = fullResponse.match(/\[PAGE_LINK:(\/[^\]]+)\]/)
          if (pageLinkMatch) {
            pageLink = pageLinkMatch[1]
            // 응답에서 [PAGE_LINK:...] 제거
            fullResponse = fullResponse.replace(/\[PAGE_LINK:\/[^\]]+\]/g, '').trim()
          }

          // 완료 신호와 메타데이터 전송
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'done',
              webSearchResults: webSearchResults.length > 0 ? webSearchResults : undefined,
              pageLink: pageLink,
              sources: contextData.sources,
              month: month
            })}\n\n`)
          )

          controller.close()
          console.log('[Chatbot] Streaming completed successfully')
        } catch (error) {
          console.error('[Chatbot] Streaming error:', error)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`)
          )
          controller.close()
        }
      }
    })

    // 스트리밍 응답 반환
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })

  } catch (error) {
    console.error('[Chatbot] Error:', error)

    // Anthropic API 에러 처리
    if (error.status === 429) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
        },
        { status: 429 }
      )
    }

    if (error.status === 401) {
      return NextResponse.json(
        {
          error: 'Invalid API key',
          message: 'API 키가 유효하지 않습니다.'
        },
        { status: 401 }
      )
    }

    // 일반 에러
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/chatbot/query
 * Health check
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Asterasys AI Chatbot',
    model: 'Claude Sonnet 4.5',
    version: '2.0.0'
  })
}
