import Joi from 'joi';

export const userRegistrationValidation = Joi.object({
  userName: Joi.string().required().messages({
    'string.empty': 'Username is required',
  }),
  userEmail: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email',
    'string.empty': 'Email is required',
    'any.required': 'Email is required',
  }),
  userPassword: Joi.string().min(5).alphanum().required().messages({
    'string.min': 'Password must be at least 4 characters',
    'string.alphanum': 'Password must be alphanumeric',
    'string.empty': 'Password is required',
  }),
  userRole: Joi.string().valid('admin', 'manager', 'public').required(),
});

export const userLoginValidation = Joi.object({
  userEmail: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email',
    'string.empty': 'Email is required',
    'any.required': 'Email is required',
  }),
  userPassword: Joi.string().min(5).alphanum().required().messages({
    'string.min': 'Password must be at least 4 characters',
    'string.alphanum': 'Password must be alphanumeric',
    'string.empty': 'Password is required',
  }),
});

export const userChangePassword = Joi.object({
  userEmail: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email',
    'string.empty': 'Email is required',
    'any.required': 'Email is required',
  }),
  userPassword: Joi.string().min(5).alphanum().required().messages({
    'string.min': 'Password must be at least 4 characters',
    'string.alphanum': 'Password must be alphanumeric',
    'string.empty': 'Password is required',
  }),
  confirmPassord: Joi.any().valid(Joi.ref('userPassword')).required(),
});
