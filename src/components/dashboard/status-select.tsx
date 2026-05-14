'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface StatusSelectProps {
  assessmentId: string;
  currentStatus: string | null;
  wantsReport: boolean | null;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: '⏳ Pending' },
  { value: 'generating', label: '⏳ Generating' },
  { value: 'sent', label: '✅ Sent' },
  { value: 'failed', label: '❌ Failed' },
] as const;

const STATUS_LABELS: Record<string, string> = {
  pending: '⏳ Pending',
  generating: '⏳ Generating',
  sent: '✅ Sent',
  failed: '❌ Failed',
};

export function StatusSelect({ assessmentId, currentStatus, wantsReport }: StatusSelectProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // If user declined, show static badge — no dropdown
  if (wantsReport === false) {
    return <span className="report-status status-declined">⛔ Declined</span>;
  }

  // Resolve the displayed value
  const resolvedStatus = currentStatus || (wantsReport === true ? 'pending' : '');

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (!newStatus || newStatus === resolvedStatus) return;

    // Confirmation dialog to prevent accidental changes
    const label = STATUS_LABELS[newStatus] || newStatus;
    const confirmed = window.confirm(`Change report status to "${label}"?`);
    if (!confirmed) {
      // Reset the select to the previous value
      e.target.value = resolvedStatus;
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/assessment-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId, reportStatus: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error('Status update failed:', data.error);
        alert(`Failed to update status: ${data.error}`);
        return;
      }

      // Refresh the server component to reflect new data
      router.refresh();
    } catch (err) {
      console.error('Status update error:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <select
      className={`status-select ${resolvedStatus ? `status-select-${resolvedStatus}` : ''}`}
      value={resolvedStatus}
      onChange={handleChange}
      disabled={saving}
      title={saving ? 'Saving…' : 'Update report status'}
    >
      {!resolvedStatus && <option value="">—</option>}
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
