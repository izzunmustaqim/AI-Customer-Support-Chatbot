'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  // global-error must include its own <html> and <body> tags
  // because it replaces the root layout when active
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          background: '#ffffff',
          color: '#1a1a2e',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 480, padding: '2rem' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', lineHeight: 1 }}>
            <span
              style={{
                background: 'linear-gradient(135deg, #001d39 0%, #0a3d6b 50%, #4CAF50 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Error
            </span>
          </h1>
          <h2 style={{ marginBottom: '1rem', fontWeight: 500 }}>
            Something went seriously wrong
          </h2>
          <p style={{ color: '#555', lineHeight: 1.7, marginBottom: '2rem' }}>
            A critical error occurred. Please try again or contact support if the problem persists.
          </p>
          {error.digest && (
            <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '1.5rem' }}>
              Error ID: {error.digest}
            </p>
          )}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => unstable_retry()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1.5rem',
                background: 'linear-gradient(135deg, #001d39 0%, #0a3d6b 50%, #4CAF50 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              🔄 Try Again
            </button>
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1.5rem',
                background: 'transparent',
                color: '#555',
                border: '1px solid rgba(0, 29, 57, 0.1)',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
