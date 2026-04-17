import { ChatWidget } from '@/components/chat/chat-widget';

export default function Home() {
  return (
    <>
      <main className="hero">
        <div className="hero-badge">
          <span>AI-Powered Customer Engine</span>
        </div>

        <h1>
          Intelligent Support,{' '}
          <span className="gradient-text">Instant Answers</span>
        </h1>

        <p className="hero-description">
          Our AI assistant understands your questions, provides instant support,
          and connects you with the right team — all in real-time.
        </p>

        <div className="hero-features">
          <div className="hero-feature">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Powered by Groq AI</span>
          </div>
          <div className="hero-feature">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Real-time Streaming</span>
          </div>
          <div className="hero-feature">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Smart Intent Detection</span>
          </div>
          <div className="hero-feature">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Analytics Dashboard</span>
          </div>
        </div>

        <div className="hero-cta">
          <span
            className="btn btn-primary"
            id="hero-cta-chat"
          >
            💬 Try the AI Assistant
          </span>
          {/* <a href="/dashboard" className="btn btn-ghost" id="hero-cta-dashboard">
            📊 View Dashboard
          </a> */}
        </div>
      </main>

      <ChatWidget />
    </>
  );
}
