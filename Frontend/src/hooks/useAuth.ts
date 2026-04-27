import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  //check auth context is not null
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
