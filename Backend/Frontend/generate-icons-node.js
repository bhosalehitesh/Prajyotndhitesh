/**
 * App Icon Generator using Node.js (No ImageMagick required)
 * Uses sharp library for image processing
 */

const fs = require('fs');
const path = require('path');

const iconSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

// Check multiple possible locations
const possibleSources = [
  path.join(__dirname, 'android', 'SmartBiz.png'),
  path.join(__dirname, 'android', 'play_store_512.png'),
  path.join(__dirname, 'src', 'assets', 'images', 'app-icon.png'),
  path.join(__dirname, 'src', 'assets', 'images', 'logo.png.jpg'),
];

const androidResPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

console.log('🎨 SmartBiz Sakhi Store - App Icon Generator\n');
console.log('='.repeat(50));

// Find source icon
let sourceIcon = null;
for (const source of possibleSources) {
  if (fs.existsSync(source)) {
    sourceIcon = source;
    console.log(`✅ Found source icon: ${path.basename(source)}`);
    break;
  }
}

if (!sourceIcon) {
  console.error('❌ No source icon found!');
  console.log('\n📝 Please place your SmartBiz.png file at one of these locations:');
  possibleSources.forEach(src => console.log(`   - ${src}`));
  process.exit(1);
}

console.log(`✅ Found source icon: ${sourceIcon}\n`);

// Try to use sharp, if not available, provide instructions
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.log('📦 Installing sharp library...\n');
  console.log('Please run: npm install sharp --save-dev');
  console.log('Then run this script again.\n');
  process.exit(1);
}

async function generateIcons() {
  console.log('🔄 Generating Android launcher icons...\n');
  
  let successCount = 0;
  
  try {
    // Generate square icons
    for (const [folder, size] of Object.entries(iconSizes)) {
      const folderPath = path.join(androidResPath, folder);
      const outputPath = path.join(folderPath, 'ic_launcher.png');
      
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      
      try {
        await sharp(sourceIcon)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .toFile(outputPath);
        
        console.log(`✅ Generated ${folder}/ic_launcher.png (${size}x${size})`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to generate ${folder}/ic_launcher.png:`, error.message);
      }
    }
    
    // Generate round icons
    for (const [folder, size] of Object.entries(iconSizes)) {
      const folderPath = path.join(androidResPath, folder);
      const outputPath = path.join(folderPath, 'ic_launcher_round.png');
      
      try {
        // Create round mask
        const mask = Buffer.from(
          `<svg width="${size}" height="${size}">
            <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/>
          </svg>`
        );
        
        await sharp(sourceIcon)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .composite([{
            input: mask,
            blend: 'dest-in'
          }])
          .toFile(outputPath);
        
        console.log(`✅ Generated ${folder}/ic_launcher_round.png (${size}x${size})`);
        successCount++;
      } catch (error) {
        // Fallback: copy square icon
        try {
          const squareIcon = path.join(folderPath, 'ic_launcher.png');
          if (fs.existsSync(squareIcon)) {
            fs.copyFileSync(squareIcon, outputPath);
            console.log(`✅ Copied square icon as ${folder}/ic_launcher_round.png`);
            successCount++;
          }
        } catch (e) {
          console.error(`❌ Failed to generate ${folder}/ic_launcher_round.png:`, error.message);
        }
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`\n✨ Successfully generated ${successCount} icon files!`);
    console.log('\n📱 Next steps:');
    console.log('   1. Clean build: cd android && ./gradlew clean');
    console.log('   2. Rebuild app: npx react-native run-android');
    console.log('   3. Check the app icon on your device/emulator');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 Alternative: Use the online tool:');
    console.log('   https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html');
  }
}

generateIcons();

