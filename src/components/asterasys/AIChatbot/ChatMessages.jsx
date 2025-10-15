'use client'

import React from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import ChatMessage from './ChatMessage'
import ThinkingIndicator from './ThinkingIndicator'

const ChatMessages = ({ messages, isLoading, messagesEndRef, onQuestionClick }) => {
  return (
    <PerfectScrollbar
      className="h-100 px-3 py-3"
      style={{
        background: '#f9fafb'
      }}
    >
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          onQuestionClick={onQuestionClick}
        />
      ))}

      {isLoading && <ThinkingIndicator />}

      <div ref={messagesEndRef} />
    </PerfectScrollbar>
  )
}

export default ChatMessages
