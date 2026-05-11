import { SYSTEM_PROMPT } from '@/lib/ai/system-prompt';

describe('System Prompt', () => {
  it('should be a non-empty string', () => {
    expect(typeof SYSTEM_PROMPT).toBe('string');
    expect(SYSTEM_PROMPT.length).toBeGreaterThan(100);
  });

  it('should define the AI personality', () => {
    expect(SYSTEM_PROMPT).toContain('Personality');
    expect(SYSTEM_PROMPT).toContain('Professional');
  });

  it('should reference EECA compliance', () => {
    expect(SYSTEM_PROMPT).toContain('EECA');
    expect(SYSTEM_PROMPT).toContain('Energy Efficiency and Conservation');
  });

  it('should include all 10 scored questions', () => {
    for (let i = 1; i <= 10; i++) {
      expect(SYSTEM_PROMPT).toContain(`Q${i}.`);
    }
  });

  it('should define section A (awareness), section B (scored), and section C (user info)', () => {
    expect(SYSTEM_PROMPT).toContain('SECTION A');
    expect(SYSTEM_PROMPT).toContain('SECTION B');
    expect(SYSTEM_PROMPT).toContain('User Info, Not Scored');
    expect(SYSTEM_PROMPT).toContain('Not Scored');
    expect(SYSTEM_PROMPT).toContain('Scored');
  });

  it('should include scoring logic', () => {
    expect(SYSTEM_PROMPT).toContain('Scoring');
    expect(SYSTEM_PROMPT).toContain('80');
    expect(SYSTEM_PROMPT).toContain('High Readiness');
    expect(SYSTEM_PROMPT).toContain('Moderate Readiness');
    expect(SYSTEM_PROMPT).toContain('Low Readiness');
    expect(SYSTEM_PROMPT).toContain('Critical Readiness Gap');
  });

  it('should include EECA Regulations 2024 reference', () => {
    expect(SYSTEM_PROMPT).toContain('P.U. (A) 466');
    expect(SYSTEM_PROMPT).toContain('21,600');
    expect(SYSTEM_PROMPT).toContain('Regulation 14');
  });

  it('should include REM and EnMS requirements', () => {
    expect(SYSTEM_PROMPT).toContain('Registered Energy Manager');
    expect(SYSTEM_PROMPT).toContain('Energy Management System');
    expect(SYSTEM_PROMPT).toContain('energy audit');
  });

  it('should include fee schedule', () => {
    expect(SYSTEM_PROMPT).toContain('Schedule of Fees');
    expect(SYSTEM_PROMPT).toContain('RM');
  });

  it('should instruct one question at a time', () => {
    expect(SYSTEM_PROMPT).toContain('ONE question at a time');
  });

  it('should use OPTION tag format for buttons', () => {
    expect(SYSTEM_PROMPT).toContain('[OPTION]');
    expect(SYSTEM_PROMPT).toContain('[/OPTION]');
  });

  it('should use CHECKBOX tag format for multiple choice', () => {
    expect(SYSTEM_PROMPT).toContain('[CHECKBOX]');
    expect(SYSTEM_PROMPT).toContain('[/CHECKBOX]');
  });
});
