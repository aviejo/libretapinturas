/**
 * Migration Script: Clean recipe_json format
 * Removes notes, confidence, isManual, isEdited from recipe_json
 * Keeps only: components, totalDrops
 * Moves notes to paint.notes field
 * 
 * Usage: node backend/scripts/clean-recipe-format.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanRecipeFormat() {
  console.log('🔧 Cleaning recipe format...\n');
  
  try {
    // Get all mix paints
    const mixes = await prisma.paint.findMany({
      where: { isMix: true }
    });
    
    console.log(`Found ${mixes.length} mixes to process\n`);
    
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const mix of mixes) {
      if (!mix.recipeJson) {
        skipped++;
        continue;
      }
      
      try {
        const parsed = JSON.parse(mix.recipeJson);
        
        // Check if it needs cleaning (has extra fields)
        const hasExtraFields = parsed.notes !== undefined || 
                              parsed.confidence !== undefined ||
                              parsed.isManual !== undefined ||
                              parsed.isEdited !== undefined;
        
        if (!hasExtraFields && !Array.isArray(parsed)) {
          // Already clean and not old array format
          skipped++;
          continue;
        }
        
        // Extract notes before cleaning
        const recipeNotes = parsed.notes || '';
        
        // Clean the recipe - keep only components and totalDrops
        let cleanedRecipe;
        if (Array.isArray(parsed)) {
          // Old array format
          cleanedRecipe = {
            components: parsed.map(c => ({
              paintId: c.paintId,
              paintName: c.name || c.paintName,
              brand: c.brand,
              drops: c.drops || 0,
              color: c.color,
              percentage: c.percentage || 0
            })),
            totalDrops: parsed.reduce((sum, c) => sum + (c.drops || 0), 0)
          };
        } else {
          // Object format with extra fields
          cleanedRecipe = {
            components: parsed.components || [],
            totalDrops: parsed.totalDrops || 
                       (parsed.components?.reduce((sum, c) => sum + (c.drops || 0), 0) || 0)
          };
        }
        
        // Update the paint with cleaned recipe
        // If paint doesn't have notes, use recipe notes
        const finalNotes = mix.notes || recipeNotes;
        
        await prisma.paint.update({
          where: { id: mix.id },
          data: {
            recipeJson: JSON.stringify(cleanedRecipe),
            notes: finalNotes
          }
        });
        
        console.log(`✅ Cleaned: ${mix.name}`);
        updated++;
      } catch (e) {
        console.error(`❌ Error processing ${mix.name}:`, e.message);
        errors++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary');
    console.log('='.repeat(60));
    console.log(`✅ Updated: ${updated}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanRecipeFormat();
