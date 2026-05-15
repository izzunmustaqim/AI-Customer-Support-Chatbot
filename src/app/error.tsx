'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error('[ErrorBoundary]', error);
  }, [error]);

  return (
    <main className="hero">
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', lineHeight: 1 }}>
          <span className="gradient-text">Oops</span>
        </h1>
        <h2 style={{ marginBottom: '1rem', fontWeight: 500 }}>Something went wrong</h2>
        <p className="hero-description" style={{ marginBottom: '2rem' }}>
          An unexpected error occurred. Please try again or return to the home page.
        </p>
        {error.digest && (
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            Error ID: {error.digest}
          </p>
        )}
        <div className="hero-cta">
          <button
            onClick={() => unstable_retry()}
            className="btn btn-primary"
            id="error-retry-btn"
          >
            🔄 Try Again
          </button>
          <a href="/" className="btn btn-ghost" id="error-home-btn">
            ← Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}
