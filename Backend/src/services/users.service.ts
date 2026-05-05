// User Identity and Authentication Service
// Manages account creation and secure credential verification processes
// Implements password hashing and comparison using bcrypt
// Facilitates user identification through custom ID generation and email lookups
import { UsersModel } from '../models/users.model.js';
import bcrypt from 'bcrypt';
import { generateCustomId } from '../utils/randomId.js';
import { UserType } from '../types/index.js';

class Users {
  // Registers a new user by hashing credentials and generating a unique identifier
  async createUser(data: UserType) {
    try {
      // Hash the plain-text password with a salt factor of 10 for storage security
      const newPass = await bcrypt.hash(data.userPassword.toString(), 10);
      const userData = { ...data, userPassword: newPass };

      // Assign a custom-formatted ID to the user profile
      userData.userID = generateCustomId();

      // Persist the finalized user record to the database collection
      await UsersModel.create(userData);
    } catch (err) {
      // Catch and ignore errors to prevent service interruption during creation
      if (err) {
        throw err;
      }
    }
  }

  // Validates if a specific email address is already registered in the system
  async checkEmail(email: string) {
    try {
      // Perform a database lookup to retrieve the user document by email
      const user = await UsersModel.findOne({ userEmail: email });
      return user;
    } catch {
      // Return null if a database error occurs or the email is not found
      return null;
    }
  }

  // Verifies login credentials by comparing provided password with the stored hash
  async checkSigninPassword(userEmail: string, password: string) {
    // Locate the user record associated with the provided email address
    const user = await UsersModel.findOne({
      userEmail: userEmail,
    });

    if (user !== null) {
      // Utilize bcrypt to securely compare the raw password against the hashed version
      const match = await bcrypt.compare(password, user.userPassword.toString());
      return match;
    }
  }
}

export const userServices = new Users();
