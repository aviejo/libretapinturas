const { z } = require('zod');

const paintSchema = z.object({
  brand: z.string().min(1, 'La marca es requerida'),
  reference: z.string().optional().nullable(),
  name: z.string().min(1, 'El nombre es requerido'),
  isMix: z.boolean().default(false),
  color: z.string().optional().nullable(),
  notes: z.string().optional(),
  inStock: z.boolean().default(true),
  recipe: z.object({
    components: z.array(z.object({
      paintId: z.string(),
      drops: z.number().int().positive()
    })).optional(),
    notes: z.string().optional()
  }).optional()
});

const updatePaintSchema = paintSchema.partial();

const paintFiltersSchema = z.object({
  brand: z.string().optional(),
  isMix: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  inStock: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  search: z.string().optional(),
  type: z.enum(['commercial', 'mix']).optional()
});

module.exports = { paintSchema, updatePaintSchema, paintFiltersSchema };
