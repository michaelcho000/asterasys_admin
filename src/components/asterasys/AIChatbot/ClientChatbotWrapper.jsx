'use client'

import dynamic from 'next/dynamic'

const FloatingChatButton = dynamic(
  () => import('./FloatingChatButton'),
  { ssr: false }
)

export default function ClientChatbotWrapper() {
  return <FloatingChatButton />
}
