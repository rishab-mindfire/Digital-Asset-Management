import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

/**
 * Global Test Setup
 *
 * This file configures the testing environment for all test suites.
 *
 * Responsibilities:
 * - Extends Vitest assertions with DOM matchers (via jest-dom)
 * - Cleans up the DOM after each test to prevent test pollution
 *
 * cleanup is important:
 * React Testing Library does not automatically unmount components between tests.
 * Without cleanup, DOM state can leak across tests and cause flaky behavior.
 *
 * @example
 * expect(element).toBeInTheDocument(); // provided by jest-dom
 */

// Highcharts TypeError: tj.CSS?.supports is not a function
Object.defineProperty(globalThis, 'CSS', {
  value: {
    supports: () => false,
  },
  writable: true,
  enumerable: true,
  configurable: true,
});

// Mocking PointerEvent for Highcharts interactions
if (!globalThis.PointerEvent) {
  globalThis.PointerEvent = class PointerEvent extends MouseEvent {};
}

// Polyfill DataTransfer for JSDOM
if (typeof Array.from !== 'undefined' && typeof globalThis.DataTransfer === 'undefined') {
  globalThis.DataTransfer = class DataTransfer {
    items = {
      add: vi.fn(),
    };
    files = [];
    setData = vi.fn();
    getData = vi.fn();
    clearData = vi.fn();
  };
}

afterEach(() => {
  // Unmounts React trees and clears the DOM after each test.
  cleanup();
});
