const fs = require('fs');
const path = require('path');

/**
 * Build script for backend deployment
 * Creates a clean build directory with only necessary files for production
 * 
 * Usage: node build.js
 * Output: backend/build/ directory ready to zip and upload
 */

const SOURCE_DIR = __dirname;
const BUILD_DIR = path.join(SOURCE_DIR, 'build');

// Files and directories to include in the build
const INCLUDE = [
  'package.json',
  'package-lock.json',
  'src',
  'prisma',
  'public',
];

// Files to exclude even if they're in included directories
const EXCLUDE = [
  '.env',
  '.env.example',
  '.env.development',
  '.env.production',
  'node_modules',
  'coverage',
  'test.db',
  'dev.db',
  'jest.config.js',
  'build.js',  // Don't include this script in the build
];

console.log('🚀 Starting backend build process...\n');

// Step 1: Clean build directory if exists
if (fs.existsSync(BUILD_DIR)) {
  console.log('🧹 Cleaning existing build directory...');
  fs.rmSync(BUILD_DIR, { recursive: true, force: true });
}

// Step 2: Create build directory
console.log('📁 Creating build directory...');
fs.mkdirSync(BUILD_DIR, { recursive: true });

// Step 3: Copy files and directories
console.log('📦 Copying files...\n');

function shouldExclude(itemPath) {
  const basename = path.basename(itemPath);
  return EXCLUDE.some(excluded => 
    itemPath.includes(excluded) || basename === excluded
  );
}

function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  
  if (shouldExclude(src)) {
    console.log(`  ⏭️  Excluded: ${path.relative(SOURCE_DIR, src)}`);
    return;
  }
  
  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    const items = fs.readdirSync(src);
    
    for (const item of items) {
      copyRecursive(
        path.join(src, item),
        path.join(dest, item)
      );
    }
  } else {
    fs.copyFileSync(src, dest);
    console.log(`  ✅ Copied: ${path.relative(SOURCE_DIR, src)}`);
  }
}

for (const item of INCLUDE) {
  const srcPath = path.join(SOURCE_DIR, item);
  const destPath = path.join(BUILD_DIR, item);
  
  if (fs.existsSync(srcPath)) {
    copyRecursive(srcPath, destPath);
  } else {
    console.warn(`  ⚠️  Warning: ${item} not found`);
  }
}

// Step 4: Create empty database directory
console.log('\n📂 Creating database directory...');
const dbDir = path.join(BUILD_DIR, 'database');
fs.mkdirSync(dbDir, { recursive: true });

// Step 5: Create .env template file
console.log('📝 Creating .env template...');
const envTemplate = `# ============================================
# PRODUCTION ENVIRONMENT - Edit these values!
# ============================================

# Server
NODE_ENV=production
PORT=3000

# Database (SQLite - will be created automatically)
DATABASE_URL=file:./database/libreta.db

# JWT Secret - GENERATE A STRONG RANDOM STRING (min 32 chars)!
# Use: openssl rand -base64 64
JWT_SECRET=YOUR_STRONG_SECRET_HERE_MIN_32_CHARACTERS

# AI Provider (Google Gemini)
# Get your API key from: https://aistudio.google.com/app/apikey
AI_PROVIDER=gemini
AI_API_KEY=YOUR_GEMINI_API_KEY_HERE
AI_URL=https://generativelanguage.googleapis.com/v1beta
AI_MODEL=gemini-2.5-flash

# CORS (your domain)
CORS_ORIGIN=https://app.tupintacomoquieras.com

# Logging
LOG_LEVEL=info
`;

fs.writeFileSync(path.join(BUILD_DIR, '.env'), envTemplate);
console.log('  ✅ Created: .env (template with instructions)');

// Step 6: Create README for deployment
console.log('📖 Creating deployment README...');
const readme = `# Backend Build - Ready for Deployment

## 📦 What's included:
- All source code (src/)
- Database schema and migrations (prisma/)
- Public files with security .htaccess
- Package.json and lock file
- Template .env file (edit before uploading!)
- Empty database/ directory

## ⚠️ IMPORTANT - Before uploading:

1. **Edit .env file** with your real values:
   - JWT_SECRET: Generate a strong random string (min 32 chars)
   - AI_API_KEY: Your Gemini API key from https://aistudio.google.com/app/apikey
   - CORS_ORIGIN: Your actual domain

2. **How to upload:**
   - Option A: Zip this entire 'build' folder and upload to cPanel
   - Option B: Upload files individually via FTP

3. **Upload location in cPanel:**
   \`/home/tupintac/app.tupintacomoquieras.com/api/\`

4. **Next steps:**
   - Configure Node.js app in cPanel
   - Run 'npm install'
   - Run 'npx prisma migrate deploy'
   - Start the app

## 🔗 Full deployment guide:
See: DEPLOYMENT/DEPLOYMENT_GUIDE.md in the main project
`;

fs.writeFileSync(path.join(BUILD_DIR, 'README.txt'), readme);
console.log('  ✅ Created: README.txt');

// Step 7: Print summary
console.log('\n' + '='.repeat(50));
console.log('✅ Build completed successfully!');
console.log('='.repeat(50));
console.log('\n📂 Build location:');
console.log(`   ${BUILD_DIR}`);
console.log('\n📋 Next steps:');
console.log('   1. Edit build/.env with your real values');
console.log('   2. Zip the build/ folder');
console.log('   3. Upload to cPanel: app.tupintacomoquieras.com/api/');
console.log('   4. Follow full guide: DEPLOYMENT/DEPLOYMENT_GUIDE.md');
console.log('\n💡 To create zip:');
console.log('   Windows: Right-click build folder → Send to → Compressed folder');
console.log('   Mac/Linux: zip -r backend.zip build/');
console.log('');
