'use client'

import React, { useMemo } from 'react'
import { parseMarkdown, sanitizeHTML } from '@/utils/markdownParser'

/**
 * InsightRenderer Component
 *
 * Renders markdown content from LLM insights with proper styling
 *
 * @param {Object} props
 * @param {string} props.content - Markdown content
 * @param {string} props.className - Additional CSS classes
 */
const InsightRenderer = ({ content, className = '' }) => {
  const htmlContent = useMemo(() => {
    if (!content) return ''

    const parsed = parseMarkdown(content)
    const sanitized = sanitizeHTML(parsed)
    return sanitized
  }, [content])

  if (!htmlContent) {
    return <p className="text-muted fs-12">인사이트 로딩 중...</p>
  }

  return (
    <div
      className={`insight-content ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{
        fontSize: '12px',
        lineHeight: '1.6',
        color: '#495057'
      }}
    />
  )
}

export default InsightRenderer
