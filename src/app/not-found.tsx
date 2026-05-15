import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="hero">
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <h1 style={{ fontSize: '5rem', marginBottom: '0.5rem', lineHeight: 1 }}>
          <span className="gradient-text">404</span>
        </h1>
        <h2 style={{ marginBottom: '1rem', fontWeight: 500 }}>Page Not Found</h2>
        <p className="hero-description" style={{ marginBottom: '2rem' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="hero-cta">
          <Link href="/" className="btn btn-primary" id="not-found-home-btn">
            ← Back to Home
          </Link>
          <Link href="/assessment" className="btn btn-ghost" id="not-found-assessment-btn">
            📋 Start Assessment
          </Link>
        </div>
      </div>
    </main>
  );
}
