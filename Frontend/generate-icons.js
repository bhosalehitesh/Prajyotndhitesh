/**
 * Android Launcher Icon Generator Script
 * 
 * This script helps generate Android launcher icons in all required sizes.
 * 
 * REQUIREMENTS:
 * - ImageMagick installed (https://imagemagick.org/)
 * - Or use the online tool: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
 * 
 * USAGE:
 * 1. Save your app icon as: Frontend/src/assets/images/app-icon.png (1024x1024 recommended)
 * 2. Install ImageMagick
 * 3. Run: node generate-icons.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const iconSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

const sourceIcon = path.join(__dirname, 'src', 'assets', 'images', 'app-icon.png');
const androidResPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

function checkImageMagick() {
  try {
    execSync('magick -version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function generateIcons() {
  if (!fs.existsSync(sourceIcon)) {
    console.error(`❌ Source icon not found at: ${sourceIcon}`);
    console.log('\n📝 Please save your app icon as: Frontend/src/assets/images/app-icon.png');
    console.log('   Recommended size: 1024x1024 pixels');
    return;
  }

  if (!checkImageMagick()) {
    console.error('❌ ImageMagick not found!');
    console.log('\n📝 Please install ImageMagick: https://imagemagick.org/');
    console.log('   Or use the online tool: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html');
    return;
  }

  console.log('🔄 Generating Android launcher icons...\n');

  // Generate square icons
  Object.entries(iconSizes).forEach(([folder, size]) => {
    const folderPath = path.join(androidResPath, folder);
    const outputPath = path.join(folderPath, 'ic_launcher.png');
    
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    try {
      execSync(`magick "${sourceIcon}" -resize ${size}x${size} -background none -gravity center -extent ${size}x${size} "${outputPath}"`);
      console.log(`✅ Generated ${folder}/ic_launcher.png (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${folder}/ic_launcher.png`);
    }
  });

  // Generate round icons (same size but with transparent corners)
  Object.entries(iconSizes).forEach(([folder, size]) => {
    const folderPath = path.join(androidResPath, folder);
    const outputPath = path.join(folderPath, 'ic_launcher_round.png');
    
    try {
      // Create a mask for round icon
      const maskPath = path.join(__dirname, 'temp_mask.png');
      execSync(`magick -size ${size}x${size} xc:none -draw "fill black circle ${size/2},${size/2} ${size/2},0" "${maskPath}"`);
      
      // Apply mask to create round icon
      execSync(`magick "${sourceIcon}" -resize ${size}x${size} "${maskPath}" -alpha off -compose CopyOpacity -composite "${outputPath}"`);
      
      // Clean up temp file
      if (fs.existsSync(maskPath)) {
        fs.unlinkSync(maskPath);
      }
      
      console.log(`✅ Generated ${folder}/ic_launcher_round.png (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${folder}/ic_launcher_round.png`);
    }
  });

  console.log('\n✨ Icon generation complete!');
  console.log('📱 Rebuild your app: npm run android');
}

generateIcons();

