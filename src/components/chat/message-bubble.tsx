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

// Parse [OPTION]...[/OPTION] and [CHECKBOX]...[/CHECKBOX] tags from text
function parseTags(text: string): {
  cleanText: string;
  options: string[];
  checkboxes: string[];
} {
  const optionRegex = /\[OPTION\](.*?)\[\/OPTION\]/g;
  const checkboxRegex = /\[CHECKBOX\](.*?)\[\/CHECKBOX\]/g;
  const options: string[] = [];
  const checkboxes: string[] = [];
  let match;

  while ((match = optionRegex.exec(text)) !== null) {
    options.push(match[1].trim());
  }

  while ((match = checkboxRegex.exec(text)) !== null) {
    checkboxes.push(match[1].trim());
  }

  // Remove both tag types from text
  const cleanText = text
    .replace(/\[OPTION\].*?\[\/OPTION\]/g, '')
    .replace(/\[CHECKBOX\].*?\[\/CHECKBOX\]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { cleanText, options, checkboxes };
}

// Check if this message is the final report
function isReportMessage(text: string): boolean {
  return (
    text.includes('/ 100') &&
    (text.includes('Readiness') || text.includes('Score')) &&
    text.length > 300
  );
}

export function MessageBubble({ message, onOptionClick }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [emailInput, setEmailInput] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
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

  const toggleCheckbox = (item: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (item === 'None of the above') {
        if (next.has(item)) {
          next.delete(item);
        } else {
          next.clear();
          next.add(item);
        }
      } else {
        next.delete('None of the above');
        if (next.has(item)) {
          next.delete(item);
        } else {
          next.add(item);
        }
      }
      return next;
    });
  };

  const handleSubmitCheckboxes = () => {
    if (checkedItems.size === 0) return;
    const selected = Array.from(checkedItems).join(', ');
    onOptionClick?.(selected);
  };

  const handleDownloadPDF = async () => {
    // Dynamic import to keep bundle small
    const { generateReportPDF } = await import('@/lib/pdf/generate-report');
    generateReportPDF(textContent);
  };

  const handleSendEmail = async () => {
    if (!emailInput.trim() || !emailInput.includes('@')) return;
    setEmailStatus('sending');
    try {
      const res = await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput.trim(),
          reportText: textContent,
        }),
      });
      if (res.ok) {
        setEmailStatus('sent');
      } else {
        setEmailStatus('error');
      }
    } catch {
      setEmailStatus('error');
    }
  };

  if (!textContent) return null;

  // Parse options and checkboxes from assistant messages
  const { cleanText, options, checkboxes } = isUser
    ? { cleanText: textContent, options: [], checkboxes: [] }
    : parseTags(textContent);

  const showReportActions = !isUser && isReportMessage(textContent);

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

        {/* Clickable Option Buttons (single choice) */}
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

        {/* Checkbox Options (multiple choice) */}
        {checkboxes.length > 0 && (
          <div className={styles.checkboxContainer}>
            {checkboxes.map((item, index) => (
              <label key={index} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkboxInput}
                  checked={checkedItems.has(item)}
                  onChange={() => toggleCheckbox(item)}
                />
                <span className={styles.checkboxCustom}>
                  {checkedItems.has(item) && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span className={styles.checkboxText}>{item}</span>
              </label>
            ))}
            <button
              className={styles.submitCheckboxBtn}
              onClick={handleSubmitCheckboxes}
              disabled={checkedItems.size === 0}
            >
              ✅ Submit Selections ({checkedItems.size})
            </button>
          </div>
        )}

        {/* Report Actions: PDF Download + Email */}
        {showReportActions && (
          <div className={styles.reportActions}>
            <button className={styles.pdfBtn} onClick={handleDownloadPDF}>
              📄 Download PDF
            </button>
            {!showEmailInput ? (
              <button
                className={styles.emailBtn}
                onClick={() => setShowEmailInput(true)}
              >
                📧 Email Report
              </button>
            ) : (
              <div className={styles.emailInputGroup}>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className={styles.emailField}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendEmail()}
                />
                <button
                  className={styles.emailSendBtn}
                  onClick={handleSendEmail}
                  disabled={emailStatus === 'sending' || emailStatus === 'sent'}
                >
                  {emailStatus === 'idle' && 'Send'}
                  {emailStatus === 'sending' && '⏳'}
                  {emailStatus === 'sent' && '✅ Sent!'}
                  {emailStatus === 'error' && '❌ Retry'}
                </button>
              </div>
            )}
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
