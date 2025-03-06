'use client'
import { cn } from '@/lib/utils'
import { IconCheck, IconLoader2, IconTrash } from '@tabler/icons-react'

interface TodoProps {
  id: string
  text: string
  completed: boolean
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  isToggling?: boolean
  isDeleting?: boolean
}

export function Todo({
  id,
  text,
  completed,
  onToggle,
  onDelete,
  isToggling = false,
  isDeleting = false
}: TodoProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 mb-2 rounded-lg transition-all group',
        completed
          ? 'bg-gray-100 dark:bg-gray-800'
          : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
      )}
    >
      <div className='flex items-center gap-3 flex-1'>
        <button
          onClick={() => onToggle(id)}
          className={cn(
            'flex items-center justify-center w-6 h-6 rounded-full border transition-colors cursor-pointer',
            completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 dark:border-gray-600',
            isToggling ? 'opacity-50 cursor-not-allowed' : ''
          )}
          aria-label={completed ? 'Mark as incomplete' : 'Mark as complete'}
          disabled={isToggling}
        >
          {isToggling ? (
            <IconLoader2 size={14} className='animate-spin' />
          ) : (
            completed && <IconCheck size={16} />
          )}
        </button>
        <span
          className={`text-sm ${
            completed
              ? 'line-through text-gray-500 dark:text-gray-400'
              : 'text-gray-800 dark:text-gray-200'
          }`}
        >
          {text}
        </span>
      </div>

      <button
        onClick={() => onDelete(id)}
        className={cn(
          'text-gray-400 hover:text-red-500 transition-colors cursor-pointer group-hover:opacity-100 opacity-0',
          isDeleting ? 'opacity-50 cursor-not-allowed' : ''
        )}
        aria-label='Delete todo'
        disabled={isDeleting}
      >
        {isDeleting ? (
          <IconLoader2 size={16} className='animate-spin' />
        ) : (
          <IconTrash size={18} />
        )}
      </button>
    </div>
  )
}
