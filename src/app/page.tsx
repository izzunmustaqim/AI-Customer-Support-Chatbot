import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="hero">
      <div className="hero-badge">
        <Image src="/sandhurst-logo.png" alt="Sandhurst Advisory" width={180} height={45} priority />
      </div>

      <h1>
        EECA Compliance & Readiness{' '}
        <span className="gradient-text">Checklist</span>
      </h1>

      <p className="hero-description">
        Check your facility&apos;s compliance readiness with the Energy Efficiency
        and Conservation Act (EECA) 2024. Our AI-powered tool guides you through
        a structured and fast assessment and provides a detailed readiness scores plus detailed action  report.
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
      </div>

      <div className="hero-cta">
        <Link href="/assessment" className="btn btn-primary" id="hero-cta-chat">
          📋 Start EECA Assessment
        </Link>
      </div>

      <div className="hero-powered-by">
        <span>Powered by</span>
        <Image src="/enerlytic-logo.png" alt="Enerlytic Intelligence" width={140} height={35} />
      </div>
    </main>
  );
}
