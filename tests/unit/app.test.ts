import { describe, expect, it } from '@jest/globals';
import app from '../../src/index';

describe('App Configuration', () => {
  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  it('should be an express app', () => {
    // This would normally use any type, but ESLint allows it in test files
    expect(typeof app).toBe('function');
  });
});
