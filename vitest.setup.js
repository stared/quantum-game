// Setup file for Vitest
// This replaces Karma setup

import { vi } from 'vitest';

// Jasmine compatibility layer for Vitest
globalThis.jasmine = {
  createSpy: (name) => vi.fn(),
};

// Wrap vi.spyOn to add Jasmine-style .and chaining
globalThis.spyOn = (obj, method) => {
  // Save original implementation before spying
  const original = obj[method];
  const spy = vi.spyOn(obj, method);
  // Add Jasmine-style .and methods
  spy.and = {
    callThrough: () => {
      // Use the original function, not the spy
      spy.mockImplementation((...args) => original.apply(obj, args));
      return spy;
    },
    returnValue: (val) => {
      spy.mockReturnValue(val);
      return spy;
    },
  };
  return spy;
};

// Mock createjs for SoundJS
globalThis.createjs = globalThis.createjs || {};
