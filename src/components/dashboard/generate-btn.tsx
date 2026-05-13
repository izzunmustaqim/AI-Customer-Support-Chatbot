'use client';

import { useState } from 'react';

interface GenerateReportBtnProps {
  assessmentId: string;
  reportEmail: string | null;
  reportStatus: string | null;
  wantsReport: boolean | null;
}

export function GenerateReportBtn({
  assessmentId,
  reportStatus,
  wantsReport,
}: GenerateReportBtnProps) {
  const [status, setStatus] = useState(reportStatus);
  const [loading, setLoading] = useState(false);

  // No button if user declined the report
  if (wantsReport === false) {
    return null;
  }

  const handleGenerate = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId }),
      });

      if (res.ok) {
        // Download the PDF
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const disposition = res.headers.get('Content-Disposition');
        const match = disposition?.match(/filename="(.+)"/);
        a.download = match?.[1] || `EECA_Report.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setStatus('sent');
      } else {
        setStatus('failed');
        const data = await res.json();
        console.error('Report generation failed:', data.error, data.details);
        alert(`Report failed: ${data.details || data.error}`);
      }
    } catch (err) {
      setStatus('failed');
      console.error('Report request error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <button className="report-btn report-btn-generating" disabled>
        <span className="spinner" /> Generating...
      </button>
    );
  }

  if (status === 'sent') {
    return (
      <button className="report-btn report-btn-resend" onClick={handleGenerate}>
        📄 Download Again
      </button>
    );
  }

  if (status === 'failed') {
    return (
      <button className="report-btn report-btn-retry" onClick={handleGenerate}>
        🔄 Retry
      </button>
    );
  }

  return (
    <button className="report-btn report-btn-generate" onClick={handleGenerate}>
      📄 Generate
    </button>
  );
}
