/**
 * Tests for Dashboard Components  
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatCard } from '@/components/dashboard/stat-card';

describe('StatCard Component', () => {
  it('should render title', () => {
    render(<StatCard title="Total Chats" value={42} icon="💬" />);
    expect(screen.getByText('Total Chats')).toBeInTheDocument();
  });

  it('should render numeric value', () => {
    render(<StatCard title="Messages" value={150} icon="📨" />);
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('should render string value', () => {
    render(<StatCard title="Rating" value="4.5/5" icon="⭐" />);
    expect(screen.getByText('4.5/5')).toBeInTheDocument();
  });

  it('should render icon', () => {
    render(<StatCard title="Test" value={0} icon="🔥" />);
    expect(screen.getByText('🔥')).toBeInTheDocument();
  });

  it('should render trend when provided', () => {
    render(<StatCard title="Test" value={10} icon="📈" trend="+15%" />);
    expect(screen.getByText('+15%')).toBeInTheDocument();
  });

  it('should not render trend when not provided', () => {
    const { container } = render(<StatCard title="Test" value={5} icon="📊" />);
    const trendEl = container.querySelector('[class*="trend"]');
    expect(trendEl).toBeNull();
  });
});
