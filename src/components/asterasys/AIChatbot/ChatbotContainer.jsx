'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import ChatbotHeader from './ChatbotHeader'
import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'
import QuickActions from './QuickActions'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'

const STORAGE_KEY = 'asterasys-chatbot-messages'

// 연쇄 질문 추출 함수
const extractSuggestedQuestions = (content) => {
  const questions = []

  // "💡 **다음 질문 힌트:**" 이후의 질문 추출
  const hintSection = content.split('💡 **다음 질문 힌트:**')[1]
  if (!hintSection) return questions

  // 1. 2. 3. 형식의 질문 추출
  const questionMatches = hintSection.match(/\d+\.\s*([^\n]+)/g)
  if (questionMatches) {
    questionMatches.forEach(match => {
      const question = match.replace(/^\d+\.\s*/, '').trim()
      if (question && !question.includes('---')) {
        questions.push(question)
      }
    })
  }

  return questions.slice(0, 3) // 최대 3개
}

const ChatbotContainer = ({ onClose }) => {
  const [messages, setMessages] = useState(() => {
    // localStorage에서 채팅 내역 복원
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          // timestamp를 Date 객체로 변환
          return parsed.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }
      } catch (error) {
        console.error('Failed to load chat history:', error)
      }
    }

    // 기본 환영 메시지
    return [
      {
        id: 1,
        role: 'assistant',
        content: '안녕하세요! 👋 Asterasys 마케팅 인사이트 어시스턴트입니다.\n\n궁금하신 데이터나 분석이 있으시면 언제든 질문해주세요!',
        timestamp: new Date()
      }
    ]
  })
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const { selectedMonth } = useSelectedMonthStore()

  // 메시지가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
      } catch (error) {
        console.error('Failed to save chat history:', error)
      }
    }
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (message) => {
    if (!message.trim() || isLoading) return

    // Add user message
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: message,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    // AI 메시지 ID 미리 생성
    const aiMessageId = Date.now() + 1
    let streamedContent = ''
    let metadata = {}
    let messageAdded = false // AI 메시지 추가 여부 추적

    try {
      // Call API with streaming (빈 메시지는 첫 청크 도착 시 추가)
      const response = await fetch('/api/chatbot/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          history: messages.slice(-10), // Last 10 messages for context
          month: selectedMonth
        })
      })

      if (!response.ok) {
        throw new Error('API request failed')
      }

      // 스트리밍 응답 처리
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // SSE 데이터 파싱
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.type === 'text') {
                // 텍스트 청크 추가
                streamedContent += data.content

                // 첫 청크 도착 시 AI 메시지 추가
                if (!messageAdded) {
                  const aiMessage = {
                    id: aiMessageId,
                    role: 'assistant',
                    content: streamedContent,
                    timestamp: new Date()
                  }
                  setMessages(prev => [...prev, aiMessage])
                  messageAdded = true
                } else {
                  // 이후 청크는 메시지 업데이트
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === aiMessageId
                        ? { ...msg, content: streamedContent }
                        : msg
                    )
                  )
                }
              } else if (data.type === 'done') {
                // 완료 - 메타데이터 저장
                metadata = {
                  webSearchResults: data.webSearchResults,
                  pageLink: data.pageLink,
                  sources: data.sources
                }
              } else if (data.type === 'error') {
                throw new Error(data.message)
              }
            } catch (parseError) {
              console.error('Failed to parse SSE data:', parseError)
            }
          }
        }
      }

      // 연쇄 질문 추출
      const suggestedQuestions = extractSuggestedQuestions(streamedContent)

      // 최종 메시지 업데이트 (메타데이터 포함)
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content: streamedContent,
                webSearchResults: metadata.webSearchResults,
                pageLink: metadata.pageLink,
                suggestedQuestions: suggestedQuestions
              }
            : msg
        )
      )
    } catch (error) {
      console.error('Chatbot error:', error)

      // 에러 메시지 처리
      if (messageAdded) {
        // 이미 추가된 메시지를 에러 메시지로 변경
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  content: '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
                  isError: true
                }
              : msg
          )
        )
      } else {
        // 메시지가 추가되지 않았다면 새로 추가
        const errorMessage = {
          id: aiMessageId,
          role: 'assistant',
          content: '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
          isError: true,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (question) => {
    handleSendMessage(question)
  }

  const handleClearChat = () => {
    if (confirm('채팅 내역을 모두 삭제하시겠습니까?')) {
      const welcomeMessage = {
        id: 1,
        role: 'assistant',
        content: '안녕하세요! 👋 Asterasys 마케팅 인사이트 어시스턴트입니다.\n\n궁금하신 데이터나 분석이 있으시면 언제든 질문해주세요!',
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  return (
    <motion.div
      className="position-fixed bg-white rounded-4 shadow-lg overflow-hidden d-flex flex-column"
      style={{
        bottom: '100px',
        right: '24px',
        width: '400px',
        height: '600px',
        zIndex: 9998,
        maxWidth: 'calc(100vw - 48px)',
        border: '1px solid #e5e7eb'
      }}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Header */}
      <ChatbotHeader onClose={onClose} onClearChat={handleClearChat} />

      {/* Messages Area */}
      <div className="flex-grow-1 overflow-hidden">
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          messagesEndRef={messagesEndRef}
          onQuestionClick={handleSendMessage}
        />
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <QuickActions onSelectAction={handleQuickAction} />
      )}

      {/* Input Area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </motion.div>
  )
}

export default ChatbotContainer
