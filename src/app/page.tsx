'use client'

import { Input } from '@/components/ui/input'
import { useChat } from '@ai-sdk/react'
import { IconRobot, IconUserCircle } from '@tabler/icons-react'

export default function Homepage() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    // Initialize with a system message to set context
    initialMessages: [
      {
        id: 'system-1',
        role: 'system',
        content:
          'You are a helpful AI assistant that provides clear and concise answers.'
      }
    ]
  })

  return (
    <div className='flex flex-col w-full max-w-lg py-24 mx-auto stretch min-h-screen'>
      <div className='flex flex-col gap-2'>
        {messages.map(m => (
          <div
            key={m.id}
            className='whitespace-pre-wrap flex items-start gap-3'
          >
            {m.role === 'user' ? (
              <IconUserCircle className='size-5 min-w-5 mt-1 text-sky-600' />
            ) : m.role === 'assistant' ? (
              <IconRobot className='size-5 min-w-5 mt-1 text-emerald-600' />
            ) : null}
            {m.role !== 'system' && (
              <p className='text-gray-600 dark:text-gray-300'>{m.content}</p>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className='mt-auto'>
        <Input
          value={input}
          placeholder='Say something...'
          onChange={handleInputChange}
          className='mt-4'
        />
      </form>

      {/* Clear chat button */}
      {messages.length > 1 && (
        <button
          onClick={() => {
            // Reload the page to reset the chat
            window.location.reload()
          }}
          className='mt-4 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        >
          Clear chat history
        </button>
      )}
    </div>
  )
}
