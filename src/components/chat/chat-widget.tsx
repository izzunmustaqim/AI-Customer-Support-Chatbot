'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { FeedbackModal } from './feedback-modal';
import styles from './chat-widget.module.css';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionId] = useState(() =>
    typeof window !== 'undefined'
      ? `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
      : 'ssr'
  );
  const [showFeedback, setShowFeedback] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  const transport = useMemo(
    () => new DefaultChatTransport({ body: { sessionId } }),
    [sessionId]
  );

  const { messages, sendMessage, status, error } = useChat({
    id: 'main-chat',
    transport,
    onFinish: () => {
      setMessageCount((prev) => prev + 1);
    },
    onError: (err) => {
      console.error('Chat error:', err);
    },
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  // Detect if assessment is complete
  const isComplete = messages.some(
    (m) => m.role === 'assistant' && m.parts?.some(
      (p) => p.type === 'text' && (p as { type: 'text'; text: string }).text.includes('[ASSESSMENT_COMPLETE]')
    )
  );

  // Show feedback after every 5 AI responses
  useEffect(() => {
    if (messageCount > 0 && messageCount % 5 === 0 && !showFeedback) {
      setShowFeedback(true);
    }
  }, [messageCount, showFeedback]);

  // Listen for 'open-chatbot' event from landing page CTA button
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-chatbot', handleOpen);
    return () => window.removeEventListener('open-chatbot', handleOpen);
  }, []);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeFeedback = useCallback(() => {
    setShowFeedback(false);
  }, []);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading || isComplete) return;

      await sendMessage({
        text,
      });
    },
    [sendMessage, isLoading, isComplete]
  );

  const handleOptionClick = useCallback(
    async (optionText: string) => {
      if (isLoading || isComplete) return;
      await sendMessage({ text: optionText });
    },
    [sendMessage, isLoading, isComplete]
  );

  return (
    <>
      {/* Floating Action Button */}
      <button
        className={`${styles.fab} ${isOpen ? styles.fabActive : ''}`}
        onClick={toggleChat}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        id="chat-fab"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow} role="dialog" aria-label="Chat assistant">
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <div className={styles.headerAvatar}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1.27A7 7 0 0 1 14 22h-4a7 7 0 0 1-6.73-3H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
                  <circle cx="10" cy="16" r="1" />
                  <circle cx="14" cy="16" r="1" />
                </svg>
              </div>
              <div>
                <h3 className={styles.headerTitle}>EECA Assessment</h3>
                <span className={styles.headerStatus}>
                  <span className={styles.statusDot} />
                  {isComplete ? 'Session Ended' : status === 'streaming' ? 'Thinking...' : status === 'submitted' ? 'Connecting...' : 'Online'}
                </span>
              </div>
            </div>
            <div className={styles.headerActions}>
              <button
                className={styles.headerBtn}
                onClick={() => setShowFeedback(true)}
                aria-label="Give feedback"
                title="Rate this conversation"
                id="chat-feedback-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
              <button
                className={styles.headerBtn}
                onClick={toggleChat}
                aria-label="Close chat"
                id="chat-close-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <MessageList messages={messages} isLoading={isLoading} onOptionClick={handleOptionClick} />

          {/* Error Display */}
          {error && (
            <div className={styles.error}>
              <div className={styles.errorIcon}>⚠️</div>
              <div className={styles.errorContent}>
                <span className={styles.errorTitle}>
                  {error.message?.includes('429')
                    ? 'Too many requests'
                    : error.message?.includes('401')
                    ? 'Authentication error'
                    : 'Connection error'}
                </span>
                <span className={styles.errorDetail}>
                  {error.message?.includes('429')
                    ? 'Service is busy. Please wait a moment and try again.'
                    : error.message?.includes('401')
                    ? 'API key is invalid or expired.'
                    : 'Something went wrong. Please try again.'}
                </span>
              </div>
              <button
                className={styles.retryBtn}
                onClick={() => window.location.reload()}
                aria-label="Retry"
              >
                🔄 Retry
              </button>
            </div>
          )}

          {/* Feedback Modal */}
          {showFeedback && conversationId && (
            <FeedbackModal
              conversationId={conversationId}
              onClose={closeFeedback}
            />
          )}

          {/* Input */}
          {isComplete ? (
            <div className={styles.completeBanner}>
              <span>✅</span>
              <span>Assessment complete.</span>
            </div>
          ) : (
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          )}
        </div>
      )}
    </>
  );
}
