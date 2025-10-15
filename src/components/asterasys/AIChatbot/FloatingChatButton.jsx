'use client'

import React, { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ChatbotContainer from './ChatbotContainer'

const FloatingChatButton = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleChatbot = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="position-fixed"
        style={{
          bottom: '24px',
          right: '24px',
          zIndex: 9999
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <motion.button
          onClick={toggleChatbot}
          className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
          style={{
            width: '60px',
            height: '60px',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            border: 'none',
            cursor: 'pointer'
          }}
          whileHover={{ scale: 1.1, boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)' }}
          whileTap={{ scale: 0.95 }}
          animate={isOpen ? {} : {
            scale: [1, 1.05, 1],
            transition: {
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse'
            }
          }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={24} strokeWidth={2} />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle size={24} strokeWidth={2} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Tooltip */}
        {!isOpen && (
          <motion.div
            className="position-absolute bg-dark text-white px-3 py-2 rounded"
            style={{
              bottom: '70px',
              right: '0',
              whiteSpace: 'nowrap',
              fontSize: '14px',
              pointerEvents: 'none'
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            AI 마케팅 어시스턴트
            <div
              className="position-absolute"
              style={{
                bottom: '-6px',
                right: '20px',
                width: '0',
                height: '0',
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid #212529'
              }}
            />
          </motion.div>
        )}
      </motion.div>

      {/* Chatbot Container */}
      <AnimatePresence>
        {isOpen && (
          <ChatbotContainer onClose={() => setIsOpen(false)} />
        )}
      </AnimatePresence>
    </>
  )
}

export default FloatingChatButton
