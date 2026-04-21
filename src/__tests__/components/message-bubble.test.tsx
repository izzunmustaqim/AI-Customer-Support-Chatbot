/**
 * Tests for MessageBubble Component
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MessageBubble } from '@/components/chat/message-bubble';
import type { UIMessage } from 'ai';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
});

const createMessage = (
  role: 'user' | 'assistant',
  text: string,
  id = 'msg-1'
): UIMessage => ({
  id,
  role,
  parts: [{ type: 'text' as const, text }],
});

describe('MessageBubble Component', () => {
  it('should render user message text', () => {
    const msg = createMessage('user', 'Hello there');
    render(<MessageBubble message={msg} />);
    expect(screen.getByText('Hello there')).toBeInTheDocument();
  });

  it('should render assistant message text', () => {
    const msg = createMessage('assistant', 'How can I help?');
    render(<MessageBubble message={msg} />);
    expect(screen.getByText('How can I help?')).toBeInTheDocument();
  });

  it('should show copy button only for assistant messages', () => {
    const assistantMsg = createMessage('assistant', 'AI response');
    const { container: assistantContainer } = render(
      <MessageBubble message={assistantMsg} />
    );
    expect(assistantContainer.querySelector('[aria-label="Copy message"]')).toBeInTheDocument();

    const userMsg = createMessage('user', 'User text');
    const { container: userContainer } = render(
      <MessageBubble message={userMsg} />
    );
    expect(userContainer.querySelector('[aria-label="Copy message"]')).not.toBeInTheDocument();
  });

  it('should copy text to clipboard when copy button is clicked', async () => {
    const msg = createMessage('assistant', 'Copy this text');
    render(<MessageBubble message={msg} />);
    const copyBtn = screen.getByLabelText('Copy message');
    await act(async () => {
      fireEvent.click(copyBtn);
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Copy this text');
  });

  it('should not render when message has no text parts', () => {
    const emptyMsg: UIMessage = {
      id: 'msg-empty',
      role: 'assistant',
      parts: [],
    };
    const { container } = render(<MessageBubble message={emptyMsg} />);
    expect(container.firstChild).toBeNull();
  });

  it('should show avatar for assistant messages', () => {
    const msg = createMessage('assistant', 'With avatar');
    const { container } = render(<MessageBubble message={msg} />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('should display timestamp', () => {
    const msg = createMessage('assistant', 'Timed message');
    render(<MessageBubble message={msg} />);
    const timePattern = /\d{1,2}:\d{2}\s*(AM|PM)/i;
    const timeElement = screen.getByText(timePattern);
    expect(timeElement).toBeInTheDocument();
  });
});
