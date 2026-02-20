const { z } = require('zod');

// Schema for imported paint (from export JSON)
const importPaintSchema = z.object({
  brand: z.string().min(1, 'La marca es requerida'),
  reference: z.string().optional().nullable().transform(val => val || ''),
  name: z.string().min(1, 'El nombre es requerido'),
  isMix: z.boolean().default(false),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color debe ser hexadecimal'),
  notes: z.string().optional().nullable().transform(val => val || ''),
  inStock: z.boolean().default(true),
  recipe: z.array(z.object({
    paintId: z.string().optional(),
    brand: z.string().optional(),
    name: z.string().optional(),
    drops: z.number().int().positive().optional(),
    parts: z.number().int().positive().optional()
  })).optional()
});

// Schema for import collection
const importCollectionSchema = z.object({
  schema_version: z.enum(['1.0'], 'Versión de schema no soportada'),
  exported_at: z.string().datetime().optional(),
  paints: z.array(importPaintSchema).min(0, 'El array de pinturas no puede ser null')
});

module.exports = { importPaintSchema, importCollectionSchema };
