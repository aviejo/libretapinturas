/**
 * Database Migration Script
 * Converts old recipe format (array) to new format (object with components)
 * 
 * Usage: node backend/scripts/migrate-recipes.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateRecipes() {
  console.log('🔧 Starting recipe migration...\n');
  
  try {
    // Get all mix paints
    const mixes = await prisma.paint.findMany({
      where: { isMix: true }
    });
    
    console.log(`Found ${mixes.length} mixes to check\n`);
    
    let migrated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const mix of mixes) {
      if (!mix.recipeJson) {
        console.log(`⚠️  Skipping ${mix.name} - no recipeJson`);
        skipped++;
        continue;
      }
      
      try {
        const parsed = JSON.parse(mix.recipeJson);
        
        // Check if it's old format (array)
        if (Array.isArray(parsed)) {
          console.log(`📝 Migrating: ${mix.name} (${mix.id})`);
          console.log(`   Old format: Array with ${parsed.length} components`);
          
          // Convert to new format
          const newRecipe = {
            components: parsed.map(c => ({
              paintId: c.paintId,
              paintName: c.name || c.paintName,
              brand: c.brand,
              drops: c.drops || 0,
              percentage: c.percentage || 0
            })),
            notes: mix.notes || '',
            totalDrops: parsed.reduce((sum, c) => sum + (c.drops || 0), 0),
            confidence: 1.0
          };
          
          // Update in database
          await prisma.paint.update({
            where: { id: mix.id },
            data: { recipeJson: JSON.stringify(newRecipe) }
          });
          
          console.log(`   ✅ Migrated successfully\n`);
          migrated++;
        } 
        // Already new format
        else if (parsed.components) {
          console.log(`✓ ${mix.name} - already new format, skipping`);
          skipped++;
        }
        // Unknown format
        else {
          console.log(`❌ ${mix.name} - unknown format:`, parsed);
          errors++;
        }
      } catch (e) {
        console.error(`❌ Error processing ${mix.name}:`, e.message);
        errors++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary');
    console.log('='.repeat(60));
    console.log(`✅ Migrated: ${migrated}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log('='. repeat(60));
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateRecipes();
