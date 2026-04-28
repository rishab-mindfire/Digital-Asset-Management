// User Role Verification Utility
// Interfaces with the database to retrieve security permissions for a specific account
// Implements lean queries to optimize performance by reducing document overhead
// Provides a foundational security layer for role-based access control (RBAC)
import { UsersModel } from '../models/users.model.js';

// Retrieves the assigned security role for an employee based on their unique email address
export async function verifyEmplyeeRole(email: string): Promise<string | null | undefined> {
  try {
    // Return immediately if the email parameter is undefined or empty
    if (!email) {
      return null;
    }

    // Query the database for the user role while excluding all other document fields
    const user = await UsersModel.findOne({ userEmail: email }, { role: 1, _id: 0 }).lean();

    // Handle cases where the user record does not exist in the collection
    if (!user) {
      return null;
    }

    // Return the role string or null if the role field itself is missing
    return user.userRole || null;
  } catch (err) {
    // Intercept database connection or query errors and return null for safety
    if (err) {
      return null;
    }
  }
}
