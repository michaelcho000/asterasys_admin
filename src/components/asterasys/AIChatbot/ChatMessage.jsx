'use client'

import React from 'react'
import Link from 'next/link'
import { User, Sparkles, ExternalLink } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

const ChatMessage = ({ message, onQuestionClick }) => {
  const isUser = message.role === 'user'
  const isError = message.isError

  // Remove the suggested questions text section and page link from content
  const displayContent = isUser
    ? message.content
    : message.content
        .split('---\n💡 **다음 질문 힌트:**')[0]
        .split('💡 **다음 질문 힌트:**')[0]
        .replace(/\[PAGE_LINK:\/[^\]]+\]/g, '') // Remove [PAGE_LINK:...] tags
        .trim()

  return (
    <div className={`d-flex gap-2 mb-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${
          isUser ? 'bg-primary' : isError ? 'bg-danger' : 'bg-light'
        }`}
        style={{
          width: '32px',
          height: '32px',
          marginTop: '4px'
        }}
      >
        {isUser ? (
          <User size={16} className="text-white" />
        ) : (
          <Sparkles size={16} className={isError ? 'text-white' : 'text-primary'} />
        )}
      </div>

      {/* Message Content */}
      <div
        className={`rounded-3 px-3 py-2 ${
          isUser
            ? 'bg-primary text-white'
            : isError
            ? 'bg-danger text-white'
            : 'bg-white'
        }`}
        style={{
          maxWidth: '75%',
          wordWrap: 'break-word',
          boxShadow: isUser ? 'none' : '0 1px 2px rgba(0,0,0,0.05)'
        }}
      >
        {isUser ? (
          <p className="mb-0" style={{ fontSize: '14px', lineHeight: '1.5' }}>
            {message.content}
          </p>
        ) : (
          <div
            className="markdown-content"
            style={{
              fontSize: '14px',
              lineHeight: '1.6',
              color: isError ? '#ffffff' : '#1f2937'
            }}
          >
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0" style={{ fontSize: '14px' }}>
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-2 ps-3" style={{ fontSize: '14px' }}>
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-2 ps-3" style={{ fontSize: '14px' }}>
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="mb-1" style={{ fontSize: '14px' }}>
                    {children}
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="fw-bold" style={{ fontSize: '14px' }}>
                    {children}
                  </strong>
                ),
                code: ({ children }) => (
                  <code
                    className="bg-light px-1 rounded"
                    style={{ fontSize: '14px' }}
                  >
                    {children}
                  </code>
                ),
                h1: ({ children }) => (
                  <h1 style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    {children}
                  </h3>
                )
              }}
            >
              {displayContent}
            </ReactMarkdown>

            {/* Data Sources - 웹 검색 결과만 표시 */}
            {message.webSearchResults && message.webSearchResults.length > 0 && (
              <div className="mt-2 pt-2" style={{ borderTop: '1px solid #e5e7eb' }}>
                <small className="text-muted d-flex align-items-center gap-1">
                  <span style={{ fontSize: '12px' }}>🌐 웹 검색 결과 포함</span>
                </small>
              </div>
            )}

            {/* Page Navigation Button */}
            {message.pageLink && (
              <div className="mt-3 pt-2" style={{ borderTop: '1px solid #e5e7eb' }}>
                <Link
                  href={message.pageLink}
                  className="btn btn-sm btn-primary d-inline-flex align-items-center gap-2"
                  style={{
                    fontSize: '13px',
                    padding: '6px 16px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <ExternalLink size={14} />
                  페이지 이동
                </Link>
              </div>
            )}

            {/* Suggested Follow-up Questions */}
            {message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
              <div className="mt-3 pt-2" style={{ borderTop: '1px solid #e5e7eb' }}>
                <small className="text-muted fw-semibold mb-2 d-block" style={{ fontSize: '12px' }}>
                  💡 다음 질문 힌트
                </small>
                <div className="d-flex flex-wrap gap-1">
                  {message.suggestedQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => onQuestionClick?.(question)}
                      className="btn btn-sm btn-light rounded-pill"
                      style={{
                        fontSize: '12px',
                        padding: '4px 12px',
                        border: '1px solid #e5e7eb',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#3b82f6'
                        e.currentTarget.style.color = '#3b82f6'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb'
                        e.currentTarget.style.color = 'inherit'
                      }}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        <div className={`mt-1 ${isUser ? 'text-end' : ''}`}>
          <small
            style={{
              fontSize: '12px',
              opacity: 0.7,
              color: isUser || isError ? 'inherit' : '#6b7280'
            }}
          >
            {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </small>
        </div>
      </div>
    </div>
  )
}

export default ChatMessage
