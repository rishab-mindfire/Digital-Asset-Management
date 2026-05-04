// Simple helper to simulate CPU load
export const simulateHeavyWork = (ms: number) => new Promise((res) => setTimeout(res, ms));
