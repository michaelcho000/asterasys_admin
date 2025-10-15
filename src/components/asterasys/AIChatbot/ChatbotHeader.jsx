'use client'

import React from 'react'
import { X, Sparkles, RotateCcw } from 'lucide-react'

const ChatbotHeader = ({ onClose, onClearChat }) => {
  return (
    <div
      className="d-flex align-items-center justify-content-between px-4 py-3 text-white"
      style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <div className="d-flex align-items-center gap-2">
        <div
          className="rounded-circle bg-white d-flex align-items-center justify-content-center"
          style={{ width: '32px', height: '32px' }}
        >
          <Sparkles size={18} className="text-primary" />
        </div>
        <div>
          <h6 className="mb-0 fw-bold text-white">Asterasys AI</h6>
          <small className="text-white" style={{ opacity: 0.9, fontSize: '11px' }}>
            마케팅 인사이트 어시스턴트
          </small>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2">
        <button
          onClick={onClearChat}
          className="btn btn-link text-white p-0"
          title="채팅 초기화"
          style={{
            opacity: 0.8,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
        >
          <RotateCcw size={18} />
        </button>

        <button
          onClick={onClose}
          className="btn btn-link text-white p-0"
          title="닫기"
          style={{
            opacity: 0.8,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
        >
          <X size={20} />
        </button>
      </div>
    </div>
  )
}

export default ChatbotHeader
