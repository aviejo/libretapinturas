const { z } = require('zod');

const generateMixSchema = z.object({
  targetBrand: z.string().min(1, 'La marca objetivo es requerida'),
  targetName: z.string().min(1, 'El nombre objetivo es requerido'),
  targetReference: z.string().optional(),
  targetColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color debe ser hexadecimal').optional(),
  // CLI flag to auto-save the mix after generation
  save: z.union([z.boolean(), z.string()]).optional(),
  // Allow additional fields from frontend (passthrough)
  description: z.string().optional(),
  availablePaintIds: z.array(z.string()).optional()
}).passthrough();

module.exports = { generateMixSchema };
