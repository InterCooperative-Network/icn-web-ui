import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
  it('should be defined', () => {
    expect(App).toBeDefined();
  });

  it('should be a function', () => {
    expect(typeof App).toBe('function');
  });
});
