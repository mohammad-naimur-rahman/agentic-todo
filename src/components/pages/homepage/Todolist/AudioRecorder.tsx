'use client'

import { Button } from '@/components/ui/button'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { cn } from '@/lib/utils'
import { IconLoader2, IconMicrophone, IconSquare } from '@tabler/icons-react'

interface AudioRecorderProps {
  onTranscriptChange: (transcript: string) => void
  MicIcon?: React.ReactNode
  StopIcon?: React.ReactNode
  onTranscriptSubmit?: () => void
  className?: string
}

/**
 * Renders a customizable speech recorder component that allows the user to record speech and listen to the transcript.
 *
 * @example
 * const handleTranscriptChange = (transcript: string) => {
 *   setValue('text', transcript, { shouldValidate: true })
 * }
 *
 * <AudioRecorder
 *   onTranscriptChange={handleTranscriptChange}
 *   MicIcon={<CustomMicIcon />}
 *   StopIcon={<CustomStopIcon />}
 *   className="custom-button-styles"
 *   onTranscriptSubmit={() => console.info('Stopped listening')}
 * />
 */
export function AudioRecorder({
  onTranscriptChange,
  MicIcon = <IconMicrophone className='size-5' />,
  StopIcon = <IconSquare className='size-4' />,
  className,
  onTranscriptSubmit
}: AudioRecorderProps) {
  const {
    isListening,
    startListening,
    stopListening,
    isPreparing,
    resetTranscript
  } = useSpeechRecognition({
    onTranscriptChange
  })

  const handleMicClick = () => {
    if (isListening) {
      if (onTranscriptSubmit) onTranscriptSubmit()
      stopListening()
    } else {
      resetTranscript()
      startListening()
    }
  }

  if (isPreparing)
    return (
      <Button
        size='icon'
        variant='outline'
        className={cn(
          'animate-pulse rounded-full border-destructive text-destructive hover:text-destructive',
          className
        )}
      >
        <IconLoader2 />
      </Button>
    )

  if (isListening) {
    return (
      <button
        onClick={handleMicClick}
        className='bg-red-500 hover:bg-red-600 text-white p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
      >
        {StopIcon}
      </button>
    )
  }

  return (
    <button
      onClick={handleMicClick}
      className='bg-cyan-500 hover:bg-cyan-600 text-white p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
    >
      {MicIcon}
    </button>
  )
}
