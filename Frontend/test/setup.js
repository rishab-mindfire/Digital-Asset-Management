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
afterEach(() => {
  // Unmounts React trees and clears the DOM after each test.
  cleanup();
});
