/**
 * Tests for Chat UI Components
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatInput } from '@/components/chat/chat-input';

describe('ChatInput Component', () => {
  const mockSendMessage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the textarea', () => {
    render(<ChatInput onSendMessage={mockSendMessage} isLoading={false} />);
    const textarea = screen.getByPlaceholderText('Type your message...');
    expect(textarea).toBeInTheDocument();
  });

  it('should render the send button', () => {
    render(<ChatInput onSendMessage={mockSendMessage} isLoading={false} />);
    const button = screen.getByLabelText('Send message');
    expect(button).toBeInTheDocument();
  });

  it('should disable send button when input is empty', () => {
    render(<ChatInput onSendMessage={mockSendMessage} isLoading={false} />);
    const button = screen.getByLabelText('Send message');
    expect(button).toBeDisabled();
  });

  it('should enable send button when input has text', () => {
    render(<ChatInput onSendMessage={mockSendMessage} isLoading={false} />);
    const textarea = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(textarea, { target: { value: 'Hello' } });
    const button = screen.getByLabelText('Send message');
    expect(button).not.toBeDisabled();
  });

  it('should call onSendMessage when send button is clicked', () => {
    render(<ChatInput onSendMessage={mockSendMessage} isLoading={false} />);
    const textarea = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(textarea, { target: { value: 'Hello AI' } });
    const button = screen.getByLabelText('Send message');
    fireEvent.click(button);
    expect(mockSendMessage).toHaveBeenCalledWith('Hello AI');
  });

  it('should clear input after sending', () => {
    render(<ChatInput onSendMessage={mockSendMessage} isLoading={false} />);
    const textarea = screen.getByPlaceholderText('Type your message...') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Hello' } });
    fireEvent.click(screen.getByLabelText('Send message'));
    expect(textarea.value).toBe('');
  });

  it('should not send empty messages', () => {
    render(<ChatInput onSendMessage={mockSendMessage} isLoading={false} />);
    const textarea = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(textarea, { target: { value: '   ' } });
    const button = screen.getByLabelText('Send message');
    expect(button).toBeDisabled();
  });

  it('should disable input when loading', () => {
    render(<ChatInput onSendMessage={mockSendMessage} isLoading={true} />);
    const textarea = screen.getByPlaceholderText('Type your message...');
    expect(textarea).toBeDisabled();
  });

  it('should show character count when typing', () => {
    render(<ChatInput onSendMessage={mockSendMessage} isLoading={false} />);
    const textarea = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(textarea, { target: { value: 'Hello' } });
    expect(screen.getByText('5 / 2000 chars')).toBeInTheDocument();
  });

  it('should show hint text when input is empty', () => {
    render(<ChatInput onSendMessage={mockSendMessage} isLoading={false} />);
    expect(screen.getByText('Enter to send · Shift+Enter for newline')).toBeInTheDocument();
  });
});
