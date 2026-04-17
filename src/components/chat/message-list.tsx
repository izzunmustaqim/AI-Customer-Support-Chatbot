'use client';

import { useEffect, useRef } from 'react';
import type { UIMessage } from 'ai';
import { MessageBubble } from './message-bubble';
import styles from './message-list.module.css';

interface MessageListProps {
  messages: UIMessage[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className={styles.messageList} id="chat-message-list">
      {/* Welcome Message */}
      {messages.length === 0 && (
        <div className={styles.welcome}>
          <div className={styles.welcomeIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1.27A7 7 0 0 1 14 22h-4a7 7 0 0 1-6.73-3H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
              <circle cx="10" cy="16" r="1" />
              <circle cx="14" cy="16" r="1" />
            </svg>
          </div>
          <h4 className={styles.welcomeTitle}>Hi there! 👋</h4>
          <p className={styles.welcomeText}>
            I&apos;m your AI assistant. Ask me anything about our products, services,
            or pricing. I&apos;m here to help!
          </p>
          <div className={styles.suggestions}>
            <span className={styles.suggestionsLabel}>Try asking:</span>
            <div className={styles.suggestionChips}>
              <button className={styles.chip}>💰 What are your pricing plans?</button>
              <button className={styles.chip}>🎯 Can I get a demo?</button>
              <button className={styles.chip}>🛠️ I need technical support</button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {/* Typing Indicator */}
      {isLoading && (
        <div className={styles.typingIndicator}>
          <div className={styles.typingAvatar}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1.27A7 7 0 0 1 14 22h-4a7 7 0 0 1-6.73-3H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
            </svg>
          </div>
          <div className={styles.typingDots}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
