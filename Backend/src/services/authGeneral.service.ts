// JWT Authentication Utility Module
// Provides secure methods for generating and validating JSON Web Tokens
import jwt from 'jsonwebtoken';

// Validates the provided token string and returns the decoded user information
export function verifyTokenAndGetUser(token: string) {
  const secret = process.env.JWT_SECRET;

  // Immediately invalidate if the token or the required secret is missing
  if (!token || !secret) {
    return null;
  }

  try {
    // Perform cryptographic verification against the signature secret
    return jwt.verify(token, secret);
  } catch (err) {
    // Catch expiration or tampering errors and return null to deny access
    if (err) {
      return null;
    }
  }
}
