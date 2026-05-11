import Joi from 'joi';

export const uploadAssetSchema = Joi.object({
  title: Joi.string().min(3).max(100).optional().messages({
    'string.min': 'Title should be at least 3 characters long',
  }),
});
