import { SYSTEM_PROMPT } from '@/lib/ai/system-prompt';

describe('System Prompt', () => {
  it('should be a non-empty string', () => {
    expect(typeof SYSTEM_PROMPT).toBe('string');
    expect(SYSTEM_PROMPT.length).toBeGreaterThan(100);
  });

  it('should define the AI personality', () => {
    expect(SYSTEM_PROMPT).toContain('Personality');
    expect(SYSTEM_PROMPT).toContain('professional');
  });

  it('should define capabilities', () => {
    expect(SYSTEM_PROMPT).toContain('Capabilities');
    expect(SYSTEM_PROMPT).toContain('pricing');
    expect(SYSTEM_PROMPT).toContain('support');
  });

  it('should include all intent categories', () => {
    const expectedIntents = [
      'pricing_inquiry',
      'support_request',
      'demo_request',
      'general_question',
      'complaint',
      'feature_request',
      'partnership_inquiry',
      'hiring_inquiry',
    ];

    expectedIntents.forEach((intent) => {
      expect(SYSTEM_PROMPT).toContain(intent);
    });
  });

  it('should include guidelines for behavior', () => {
    expect(SYSTEM_PROMPT).toContain('Guidelines');
    expect(SYSTEM_PROMPT).toContain('helpful');
  });

  it('should instruct concise responses', () => {
    expect(SYSTEM_PROMPT).toContain('concise');
  });
});
