'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import './login.css';

export default function DashboardLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/dashboard-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid password');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card glass-card">
        <div className="login-header">
          <div className="login-icon">🔐</div>
          <h1>Dashboard Access</h1>
          <p>Enter the admin password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="dashboard-password">Password</label>
            <input
              id="dashboard-password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoFocus
              disabled={loading}
            />
          </div>

          {error && (
            <div className="login-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary login-submit"
            disabled={loading || !password}
          >
            {loading ? (
              <>
                <span className="spinner" /> Verifying…
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="login-footer">
          <a href="/" className="btn btn-ghost">← Back to Chat</a>
        </div>
      </div>
    </div>
  );
}
