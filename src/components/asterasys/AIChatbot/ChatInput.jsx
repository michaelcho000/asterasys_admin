'use client'

import React, { useState } from 'react'
import { Send } from 'lucide-react'

const ChatInput = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input)
      setInput('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="d-flex align-items-end gap-2 p-3 bg-white"
      style={{
        borderTop: '1px solid #e5e7eb'
      }}
    >
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="궁금한 것을 질문해보세요..."
        disabled={isLoading}
        className="form-control"
        rows={1}
        style={{
          resize: 'none',
          fontSize: '14px',
          border: '1px solid #d1d5db',
          borderRadius: '12px',
          maxHeight: '100px'
        }}
      />

      <button
        type="submit"
        disabled={!input.trim() || isLoading}
        className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
        style={{
          width: '40px',
          height: '40px',
          padding: 0
        }}
      >
        <Send size={18} />
      </button>
    </form>
  )
}

export default ChatInput
