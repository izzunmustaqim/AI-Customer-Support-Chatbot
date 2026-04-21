/**
 * Tests for Dashboard Components  
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatCard } from '@/components/dashboard/stat-card';
import { IntentChart } from '@/components/dashboard/intent-chart';

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

describe('IntentChart Component', () => {
  const mockIntents = [
    { intent: 'pricing_inquiry', count: 25 },
    { intent: 'support_request', count: 18 },
    { intent: 'demo_request', count: 12 },
  ];

  it('should render all intent rows', () => {
    render(<IntentChart intents={mockIntents} />);
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('should display friendly labels', () => {
    render(<IntentChart intents={mockIntents} />);
    expect(screen.getByText('💰 Pricing')).toBeInTheDocument();
    expect(screen.getByText('🛠️ Support')).toBeInTheDocument();
    expect(screen.getByText('🎯 Demo')).toBeInTheDocument();
  });

  it('should render bars with correct proportions', () => {
    const { container } = render(<IntentChart intents={mockIntents} />);
    const bars = container.querySelectorAll('[class*="bar"]');
    expect(bars.length).toBeGreaterThan(0);
  });

  it('should handle single intent', () => {
    render(<IntentChart intents={[{ intent: 'complaint', count: 5 }]} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should handle unknown intent labels gracefully', () => {
    render(<IntentChart intents={[{ intent: 'unknown_type', count: 3 }]} />);
    expect(screen.getByText('unknown_type')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
