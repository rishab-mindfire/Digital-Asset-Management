// JWT Authentication Utility Module
// Provides secure methods for generating and validating JSON Web Tokens
// Manages user session persistence through cryptographic signature verification
// Abstracts the complexity of token signing and payload extraction for the auth layer
import jwt from 'jsonwebtoken';

// Generates a signed JWT token containing the user email with a 1 day expiration
export function generateToken(user: { userEmail: string }) {
  const secret = process.env.JWT_SECRET;

  // Ensure the cryptographic secret is defined before attempting to sign
  if (secret) {
    return jwt.sign(user, secret, {
      expiresIn: 60 * 60 * 12 * 2,
    });
  }
}

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
