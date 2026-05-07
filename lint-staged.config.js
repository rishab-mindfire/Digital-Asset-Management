export default {
  './Frontend/src/**/*.{ts,tsx}': [
    'npm --prefix Frontend run lint',
    'npm --prefix Frontend run format'
  ],
  './Backend/src/**/*.{ts,tsx}': [
    'npm --prefix Backend run lint',
    'npm --prefix Backend run format'
  ],
};
