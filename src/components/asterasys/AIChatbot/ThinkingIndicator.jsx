'use client'

import React from 'react'
import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

const ThinkingIndicator = () => {
  return (
    <div className="d-flex gap-2 mb-3">
      {/* Avatar */}
      <div
        className="rounded-circle bg-light d-flex align-items-center justify-content-center flex-shrink-0"
        style={{
          width: '32px',
          height: '32px',
          marginTop: '4px'
        }}
      >
        <Sparkles size={16} className="text-primary" />
      </div>

      {/* Thinking Animation */}
      <div
        className="bg-white rounded-3 px-3 py-2 d-flex align-items-center gap-1"
        style={{
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}
      >
        <span style={{ fontSize: '14px', color: '#6b7280' }}>분석 중</span>
        <div className="d-flex gap-1 ms-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="rounded-circle bg-primary"
              style={{
                width: '6px',
                height: '6px'
              }}
              animate={{
                y: [0, -8, 0],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ThinkingIndicator
