'use client';

import { useState } from 'react';
import styles from './feedback-modal.module.css';

interface FeedbackModalProps {
  conversationId: string;
  onClose: () => void;
}

export function FeedbackModal({ conversationId, onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;

    setLoading(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          rating,
          comment: comment || null,
        }),
      });
      setSubmitted(true);
      setTimeout(onClose, 2000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {submitted ? (
          <div className={styles.success}>
            <span className={styles.successIcon}>✨</span>
            <h4>Thank you!</h4>
            <p>Your feedback helps us improve.</p>
          </div>
        ) : (
          <>
            <div className={styles.modalHeader}>
              <h4>Rate your experience</h4>
              <button
                className={styles.closeBtn}
                onClick={onClose}
                aria-label="Close feedback"
                id="feedback-close-btn"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`${styles.star} ${
                    star <= (hoveredRating || rating) ? styles.starActive : ''
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  aria-label={`Rate ${star} stars`}
                  id={`feedback-star-${star}`}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={star <= (hoveredRating || rating) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              ))}
            </div>

            <textarea
              className={styles.commentInput}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Any additional feedback? (optional)"
              rows={3}
              id="feedback-comment"
            />

            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={rating === 0 || loading}
              id="feedback-submit-btn"
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
