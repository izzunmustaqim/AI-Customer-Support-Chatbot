import Link from 'next/link';

export default function Home() {
  return (
    <main className="hero">
      <div className="hero-badge">
        <span>EECA Compliance Assessment Tool</span>
      </div>

      <h1>
        EECA Readiness{' '}
        <span className="gradient-text">Assessment</span>
      </h1>

      <p className="hero-description">
        Check your facility&apos;s compliance readiness with the Energy Efficiency
        and Conservation Act (EECA). Our AI-powered tool guides you through
        a structured assessment and provides a detailed readiness report.
      </p>

      <div className="hero-features">
        <div className="hero-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>15-Question Assessment</span>
        </div>
        <div className="hero-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Instant Readiness Score</span>
        </div>
        <div className="hero-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Gap Analysis &amp; Action Plan</span>
        </div>
        <div className="hero-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Powered by AI</span>
        </div>
      </div>

      <div className="hero-cta">
        <Link href="/assessment" className="btn btn-primary" id="hero-cta-chat">
          📋 Start EECA Assessment
        </Link>
      </div>
    </main>
  );
}
