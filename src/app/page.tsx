'use client'

import { Input } from '@/components/ui/input'
import { useChat } from '@ai-sdk/react'
import { IconRobot, IconUserCircle } from '@tabler/icons-react'

export default function Homepage() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()
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
            ) : (
              <IconRobot className='size-5 min-w-5 mt-1 text-emerald-600' />
            )}
            <p className='text-gray-600 dark:text-gray-300'>{m.content}</p>
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
    </div>
  )
}
