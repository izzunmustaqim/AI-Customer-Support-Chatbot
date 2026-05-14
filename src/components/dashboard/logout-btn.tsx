'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LogoutBtn() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/dashboard-auth', { method: 'DELETE' });
      router.push('/dashboard/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="btn btn-ghost logout-btn"
      onClick={handleLogout}
      disabled={loading}
      title="Sign out"
    >
      {loading ? '…' : '🚪 Logout'}
    </button>
  );
}
