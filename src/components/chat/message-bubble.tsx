'use client';

import { useState } from 'react';
import type { UIMessage } from 'ai';
import styles from './message-bubble.module.css';

interface MessageBubbleProps {
  message: UIMessage;
  onOptionClick?: (optionText: string) => void;
}

// Extract text content from UIMessage parts array
function getTextContent(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => (part as { type: 'text'; text: string }).text)
    .join('');
}

// Parse [OPTION]...[/OPTION] tags from text
function parseOptions(text: string): { cleanText: string; options: string[] } {
  const optionRegex = /\[OPTION\](.*?)\[\/OPTION\]/g;
  const options: string[] = [];
  let match;

  while ((match = optionRegex.exec(text)) !== null) {
    options.push(match[1].trim());
  }

  // Remove option tags from text
  const cleanText = text
    .replace(/\[OPTION\].*?\[\/OPTION\]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { cleanText, options };
}

export function MessageBubble({ message, onOptionClick }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const textContent = getTextContent(message);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!textContent) return null;

  // Parse options from assistant messages
  const { cleanText, options } = isUser
    ? { cleanText: textContent, options: [] }
    : parseOptions(textContent);

  return (
    <div
      className={`${styles.messageRow} ${isUser ? styles.userRow : styles.assistantRow}`}
    >
      {!isUser && (
        <div className={styles.avatar}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1.27A7 7 0 0 1 14 22h-4a7 7 0 0 1-6.73-3H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
          </svg>
        </div>
      )}

      <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.assistantBubble}`}>
        <div className={styles.content}>{cleanText}</div>

        {/* Clickable Option Buttons */}
        {options.length > 0 && (
          <div className={styles.optionsContainer}>
            {options.map((option, index) => (
              <button
                key={index}
                className={styles.optionBtn}
                onClick={() => onOptionClick?.(option)}
                aria-label={`Select: ${option}`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        <div className={styles.meta}>
          <span className={styles.time}>{formatTime()}</span>
          {!isUser && (
            <button
              className={styles.copyBtn}
              onClick={handleCopy}
              aria-label="Copy message"
              title={copied ? 'Copied!' : 'Copy to clipboard'}
            >
              {copied ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
