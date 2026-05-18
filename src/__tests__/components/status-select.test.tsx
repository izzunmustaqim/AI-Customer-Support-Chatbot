/**
 * Tests for StatusSelect Component
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatusSelect } from '@/components/dashboard/status-select';

// Mock next/navigation
const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
    push: jest.fn(),
  }),
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock confirm dialog
const mockConfirm = jest.fn();
global.confirm = mockConfirm;

describe('StatusSelect Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });
    mockConfirm.mockReturnValue(true);
  });

  it('should render a static "Declined" badge when user declined report', () => {
    render(
      <StatusSelect assessmentId="1" currentStatus={null} wantsReport={false} />
    );
    expect(screen.getByText('⛔ Declined')).toBeInTheDocument();
  });

  it('should not render dropdown when user declined report', () => {
    const { container } = render(
      <StatusSelect assessmentId="1" currentStatus={null} wantsReport={false} />
    );
    expect(container.querySelector('select')).toBeNull();
  });

  it('should render a select dropdown for pending status', () => {
    const { container } = render(
      <StatusSelect assessmentId="1" currentStatus="pending" wantsReport={true} />
    );
    const select = container.querySelector('select');
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('pending');
  });

  it('should render all status options', () => {
    render(
      <StatusSelect assessmentId="1" currentStatus="pending" wantsReport={true} />
    );
    expect(screen.getByText('⏳ Pending')).toBeInTheDocument();
    expect(screen.getByText('⏳ Generating')).toBeInTheDocument();
    expect(screen.getByText('✅ Sent')).toBeInTheDocument();
    expect(screen.getByText('❌ Failed')).toBeInTheDocument();
  });

  it('should resolve status from wantsReport when currentStatus is null', () => {
    const { container } = render(
      <StatusSelect assessmentId="1" currentStatus={null} wantsReport={true} />
    );
    const select = container.querySelector('select');
    expect(select).toHaveValue('pending');
  });

  it('should show em dash option when both currentStatus and wantsReport are null', () => {
    render(
      <StatusSelect assessmentId="1" currentStatus={null} wantsReport={null} />
    );
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('should show confirm dialog before changing status', () => {
    const { container } = render(
      <StatusSelect assessmentId="1" currentStatus="pending" wantsReport={true} />
    );
    const select = container.querySelector('select')!;
    fireEvent.change(select, { target: { value: 'sent' } });
    expect(mockConfirm).toHaveBeenCalled();
  });

  it('should call API when status change is confirmed', async () => {
    const { container } = render(
      <StatusSelect assessmentId="abc-123" currentStatus="pending" wantsReport={true} />
    );
    const select = container.querySelector('select')!;
    fireEvent.change(select, { target: { value: 'sent' } });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/assessment-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId: 'abc-123', reportStatus: 'sent' }),
      });
    });
  });

  it('should not call API when confirm is cancelled', () => {
    mockConfirm.mockReturnValue(false);
    const { container } = render(
      <StatusSelect assessmentId="1" currentStatus="pending" wantsReport={true} />
    );
    const select = container.querySelector('select')!;
    fireEvent.change(select, { target: { value: 'sent' } });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should call router.refresh after successful update', async () => {
    const { container } = render(
      <StatusSelect assessmentId="1" currentStatus="pending" wantsReport={true} />
    );
    const select = container.querySelector('select')!;
    fireEvent.change(select, { target: { value: 'sent' } });

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('should apply correct CSS class based on status', () => {
    const { container } = render(
      <StatusSelect assessmentId="1" currentStatus="sent" wantsReport={true} />
    );
    const select = container.querySelector('select');
    expect(select).toHaveClass('status-select-sent');
  });
});
