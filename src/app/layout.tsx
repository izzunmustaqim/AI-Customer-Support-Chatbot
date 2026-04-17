import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'AI Customer Assistant | Intelligent Chat Support',
  description:
    'Experience next-generation customer support powered by AI. Get instant answers, book demos, and connect with our team through our intelligent chat assistant.',
  keywords: ['AI chatbot', 'customer support', 'AI assistant', 'live chat'],
  openGraph: {
    title: 'AI Customer Assistant',
    description: 'Intelligent AI-powered customer support',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>{children}</body>
    </html>
  );
}
