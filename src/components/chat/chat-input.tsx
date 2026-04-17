'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import styles from './chat-input.module.css';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  // Focus textarea when component mounts
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={styles.inputForm} id="chat-input-form">
      <div className={styles.inputWrapper}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={isLoading}
          rows={1}
          id="chat-input-textarea"
          aria-label="Chat message input"
        />
        <button
          type="button"
          className={styles.sendBtn}
          disabled={!input.trim() || isLoading}
          onClick={handleSubmit}
          aria-label="Send message"
          id="chat-send-btn"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
      <div className={styles.inputHint}>
        <span>
          {input.length > 0 ? `${input.length} chars` : 'Enter to send · Shift+Enter for newline'}
        </span>
      </div>
    </div>
  );
}
