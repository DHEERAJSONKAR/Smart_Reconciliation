import Joi from 'joi';
import { ReconciliationStatus } from '../models/ReconciliationResult.model';

export const updateReconciliationResultSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(ReconciliationStatus))
    .optional(),
  notes: Joi.string().max(1000).optional(),
}).min(1);

export const uploadJobIdSchema = Joi.object({
  uploadJobId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid upload job ID format',
      'any.required': 'Upload job ID is required',
    }),
});

export const reconciliationResultIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid reconciliation result ID format',
      'any.required': 'Reconciliation result ID is required',
    }),
});
