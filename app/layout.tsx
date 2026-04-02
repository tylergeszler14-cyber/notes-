import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "21st Agent Chat",
  description: "Chat with your 21st Agent",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
