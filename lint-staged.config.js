export default {
  'frontend/**/*.{ts,tsx}': [
    'npm --prefix frontend run lint',
    'npm --prefix frontend run format'
  ],
  'backend/**/*.{ts,tsx}': [
    'npm --prefix backend run lint',
    'npm --prefix backend run format'
  ],
};
