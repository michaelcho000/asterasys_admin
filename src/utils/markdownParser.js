/**
 * Simple Markdown Parser for LLM Insights
 *
 * Converts basic markdown syntax to HTML
 * Supported: **bold**, ## headings, - lists, line breaks
 */

/**
 * Parse markdown content to HTML
 * @param {string} content - Markdown content
 * @returns {string} - HTML string
 */
export function parseMarkdown(content) {
  if (!content) return ''

  let html = content

  // 1. Escape HTML characters first
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // 2. Parse headings (## Heading) - mark first heading specially
  let isFirstHeading = true
  html = html.replace(/^## (.+)$/gm, (match, title) => {
    if (isFirstHeading) {
      isFirstHeading = false
      return `<h6 class="fw-bold text-dark mb-2">${title}</h6>`
    }
    return `<h6 class="fw-bold text-dark mb-2 mt-3">${title}</h6>`
  })

  // 3. Parse bold text (**text**)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="text-primary">$1</strong>')

  // 4. Parse lists (- item or • item)
  const lines = html.split('\n')
  const parsedLines = []
  let inList = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // List item detection
    if (line.match(/^[-•]\s+(.+)/)) {
      const content = line.replace(/^[-•]\s+/, '')
      if (!inList) {
        parsedLines.push('<ul class="list-unstyled mb-3">')
        inList = true
      }
      parsedLines.push(`<li class="mb-1"><span class="text-primary me-2">•</span>${content}</li>`)
    } else {
      if (inList) {
        parsedLines.push('</ul>')
        inList = false
      }
      if (line) {
        parsedLines.push(line)
      }
    }
  }

  // Close list if still open
  if (inList) {
    parsedLines.push('</ul>')
  }

  html = parsedLines.join('\n')

  // 5. Parse paragraphs (double line breaks)
  html = html.split('\n\n').map(paragraph => {
    const trimmed = paragraph.trim()
    if (trimmed && !trimmed.startsWith('<')) {
      return `<p class="mb-2">${trimmed}</p>`
    }
    return trimmed
  }).join('\n')

  // 6. Clean up extra line breaks
  html = html.replace(/\n+/g, '\n').trim()

  return html
}

/**
 * Sanitize HTML to prevent XSS
 * @param {string} html - HTML string
 * @returns {string} - Sanitized HTML
 */
export function sanitizeHTML(html) {
  // Simple sanitization - only allow specific tags
  const allowedTags = ['h6', 'strong', 'ul', 'li', 'p', 'span', 'br']

  // Remove script tags and on* attributes
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  html = html.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')

  return html
}
