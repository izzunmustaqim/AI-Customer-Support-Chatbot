'use client';

import { useState, FormEvent } from 'react';
import styles from './contact-form.module.css';

interface ContactFormProps {
  conversationId: string | null;
  onSuccess?: () => void;
}

export function ContactForm({ conversationId, onSuccess }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          ...formData,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        onSuccess?.();
      } else {
        setError('Failed to submit. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.successCard}>
        <span className={styles.successIcon}>🎉</span>
        <h4>Thank you, {formData.name || 'friend'}!</h4>
        <p>We&apos;ll be in touch soon.</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} id="contact-form">
      <h4 className={styles.formTitle}>Get in Touch</h4>
      <p className={styles.formDesc}>
        Leave your details and we&apos;ll reach out to you.
      </p>

      <div className={styles.fieldRow}>
        <input
          className={styles.field}
          type="text"
          name="name"
          placeholder="Your name"
          value={formData.name}
          onChange={handleChange}
          id="contact-name"
        />
        <input
          className={styles.field}
          type="email"
          name="email"
          placeholder="Email *"
          value={formData.email}
          onChange={handleChange}
          required
          id="contact-email"
        />
      </div>

      <div className={styles.fieldRow}>
        <input
          className={styles.field}
          type="tel"
          name="phone"
          placeholder="Phone (optional)"
          value={formData.phone}
          onChange={handleChange}
          id="contact-phone"
        />
        <input
          className={styles.field}
          type="text"
          name="company"
          placeholder="Company (optional)"
          value={formData.company}
          onChange={handleChange}
          id="contact-company"
        />
      </div>

      <textarea
        className={styles.messageField}
        name="message"
        placeholder="How can we help?"
        value={formData.message}
        onChange={handleChange}
        rows={3}
        id="contact-message"
      />

      {error && <p className={styles.error}>{error}</p>}

      <button
        type="submit"
        className={styles.submitBtn}
        disabled={loading}
        id="contact-submit-btn"
      >
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
