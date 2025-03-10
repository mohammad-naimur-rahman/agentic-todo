'use client'

import { IconDownload } from '@tabler/icons-react'
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export default function PwaInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if the app is already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true)
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default behavior
      e.preventDefault()
      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    // Listen for the appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      )
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // Function to handle the install click
  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    await deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice

    // Reset deferredPrompt to null
    setDeferredPrompt(null)

    // Track the outcome
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }
  }

  // Don't show the button if the app is already installed or in standalone mode
  if (isInstalled || isStandalone) {
    return null
  }

  // Only show the button if the install prompt is available
  if (!deferredPrompt) {
    return null
  }

  return (
    <button
      onClick={handleInstallClick}
      className='fixed top-4 right-4 z-50 flex items-center gap-1 rounded-md bg-transparent px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 cursor-pointer'
      aria-label='Install App'
    >
      <IconDownload size={16} />
      <span>Install App</span>
    </button>
  )
}
