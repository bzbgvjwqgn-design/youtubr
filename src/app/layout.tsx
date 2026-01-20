import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Youtubr - Support Indian Creators",
  description: "Premium support platform for Indian YouTubers. Monthly or one-time support via UPI, cards, and net banking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#FF0000" />
      </head>
      <body className="bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
