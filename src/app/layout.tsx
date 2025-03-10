import PwaInstall from '@/components/PwaInstall'
import ReduxProvider from '@/redux/redux-provider'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ReactNode } from 'react'
import { Toaster } from 'sonner'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'Smart Todo App',
  description:
    'A modern todo application with natural language command capabilities',
  manifest: '/manifest.json',
  icons: {
    apple: '/icons/icon-192x192.png'
  }
}

export const viewport: Viewport = {
  themeColor: '#000000'
}

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang='en'>
      <head>
        <link rel='manifest' href='/manifest.json' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='black' />
        <meta name='apple-mobile-web-app-title' content='Smart Todo App' />
        <link rel='apple-touch-icon' href='/icons/icon-192x192.png' />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('Service Worker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('Service Worker registration failed: ', err);
                    }
                  );
                });
              }
            `
          }}
        />
      </head>
      <ReduxProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <PwaInstall />
          <main>{children}</main>
          <Toaster
            position='top-right'
            toastOptions={{
              duration: 3000,
              className: 'text-sm',
              style: {
                background: 'var(--background)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)'
              }
            }}
          />
        </body>
      </ReduxProvider>
    </html>
  )
}
