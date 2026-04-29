'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useCallback } from 'react';
import { MessageList } from '@/components/chat/message-list';
import { ChatInput } from '@/components/chat/chat-input';
import './assessment.css';

export default function AssessmentPage() {
  const { messages, sendMessage, status, error } = useChat({
    id: 'assessment-chat',
    onError: (err) => {
      console.error('Chat error:', err);
    },
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;
      await sendMessage({ text });
    },
    [sendMessage, isLoading]
  );

  const handleOptionClick = useCallback(
    async (optionText: string) => {
      if (isLoading) return;
      await sendMessage({ text: optionText });
    },
    [sendMessage, isLoading]
  );

  return (
    <div className="assessment-page">
      {/* Header */}
      <header className="assessment-header">
        <a href="/" className="assessment-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </a>
        <div className="assessment-title-group">
          <div className="assessment-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1.27A7 7 0 0 1 14 22h-4a7 7 0 0 1-6.73-3H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
              <circle cx="10" cy="16" r="1" />
              <circle cx="14" cy="16" r="1" />
            </svg>
          </div>
          <div>
            <h1 className="assessment-title">EECA Readiness Assessment</h1>
            <span className="assessment-status">
              <span className="assessment-status-dot" />
              {status === 'streaming' ? 'Thinking...' : status === 'submitted' ? 'Connecting...' : 'Online'}
            </span>
          </div>
        </div>
        <div className="assessment-header-spacer" />
      </header>

      {/* Chat Area */}
      <div className="assessment-chat">
        <div className="assessment-chat-inner">
          <MessageList
            messages={messages}
            isLoading={isLoading}
            onOptionClick={handleOptionClick}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="assessment-error">
          <span>⚠️</span>
          <span>
            {error.message?.includes('429')
              ? 'Service is busy. Please wait a moment and try again.'
              : error.message?.includes('401')
              ? 'API key is invalid or expired.'
              : 'Something went wrong. Please try again.'}
          </span>
          <button onClick={() => window.location.reload()}>🔄 Retry</button>
        </div>
      )}

      {/* Input */}
      <div className="assessment-input-wrapper">
        <div className="assessment-input-inner">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
