import Joi, { ValidationResult } from "joi";

const createProductSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  count: Joi.number().required(),
});

export const validateProductOnCreate = (product: unknown): ValidationResult => {
  return createProductSchema.validate(product);
};
