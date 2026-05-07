export default {
  'frontend/**/*.{ts,tsx}': [
    'npm --prefix Frontend run lint',
    'npm --prefix Frontend run format'
  ],
  'backend/**/*.{ts,tsx}': [
    'npm --prefix Backend run lint',
    'npm --prefix Backend run format'
  ],
};
