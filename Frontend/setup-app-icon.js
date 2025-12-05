/**
 * App Icon Setup Script for SmartBiz Sakhi Store
 * 
 * This script helps set up the app icon for Android
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

console.log('🎨 SmartBiz Sakhi Store - App Icon Setup\n');
console.log('='.repeat(50));

// Check for source icon
const possibleSources = [
  path.join(__dirname, 'android', 'SmartBiz.png'), // Primary source
  path.join(__dirname, 'src', 'assets', 'images', 'app-icon.png'),
  path.join(__dirname, 'src', 'assets', 'images', 'logo.png.jpg'),
  path.join(__dirname, 'src', 'assets', 'images', 'logo.png'),
];

let foundSource = null;
for (const source of possibleSources) {
  if (fs.existsSync(source)) {
    foundSource = source;
    console.log(`✅ Found source image: ${path.basename(source)}`);
    break;
  }
}

if (!foundSource) {
  console.log('❌ No source icon found!');
  console.log('\n📝 Please save your SmartBiz Sakhi Store logo as:');
  console.log('   Frontend/src/assets/images/app-icon.png');
  console.log('   Recommended size: 1024x1024 pixels (PNG format)');
  console.log('\n💡 Then run this script again, or use the online tool:');
  console.log('   https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html');
  process.exit(1);
}

// Check for ImageMagick
function checkImageMagick() {
  try {
    execSync('magick -version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

if (!checkImageMagick()) {
  console.log('\n⚠️  ImageMagick not found!');
  console.log('\n📝 Two options:');
  console.log('\n1. Install ImageMagick:');
  console.log('   Windows: https://imagemagick.org/script/download.php');
  console.log('   Mac: brew install imagemagick');
  console.log('   Linux: sudo apt-get install imagemagick');
  console.log('\n2. Use online tool (Recommended):');
  console.log('   https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html');
  console.log('   - Upload:', foundSource);
  console.log('   - Download generated icons');
  console.log('   - Extract to: Frontend/android/app/src/main/res/');
  console.log('\n📖 See SETUP_SMARTBIZ_ICON.md for detailed step-by-step instructions!');
  process.exit(1);
}

console.log('✅ ImageMagick found!\n');
console.log('🔄 Generating Android launcher icons...\n');

// Copy source to app-icon.png if it's a different file
if (foundSource !== sourceIcon) {
  fs.copyFileSync(foundSource, sourceIcon);
  console.log(`📋 Copied ${path.basename(foundSource)} to app-icon.png\n`);
}

// Generate square icons
let successCount = 0;
Object.entries(iconSizes).forEach(([folder, size]) => {
  const folderPath = path.join(androidResPath, folder);
  const outputPath = path.join(folderPath, 'ic_launcher.png');
  
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  try {
    execSync(`magick "${sourceIcon}" -resize ${size}x${size} -background none -gravity center -extent ${size}x${size} "${outputPath}"`, { stdio: 'ignore' });
    console.log(`✅ Generated ${folder}/ic_launcher.png (${size}x${size})`);
    successCount++;
  } catch (error) {
    console.error(`❌ Failed to generate ${folder}/ic_launcher.png`);
  }
});

// Generate round icons
Object.entries(iconSizes).forEach(([folder, size]) => {
  const folderPath = path.join(androidResPath, folder);
  const outputPath = path.join(folderPath, 'ic_launcher_round.png');
  
  try {
    // Create round icon with transparent corners
    execSync(`magick "${sourceIcon}" -resize ${size}x${size} -background none -gravity center -extent ${size}x${size} -alpha set -channel A -fx "hypot(i-w/2,j-h/2) < min(w,h)/2 ? 1 : 0" "${outputPath}"`, { stdio: 'ignore' });
    console.log(`✅ Generated ${folder}/ic_launcher_round.png (${size}x${size})`);
    successCount++;
  } catch (error) {
    // Fallback: just copy square icon as round
    try {
      const squareIcon = path.join(folderPath, 'ic_launcher.png');
      if (fs.existsSync(squareIcon)) {
        fs.copyFileSync(squareIcon, outputPath);
        console.log(`✅ Copied square icon as ${folder}/ic_launcher_round.png`);
        successCount++;
      }
    } catch (e) {
      console.error(`❌ Failed to generate ${folder}/ic_launcher_round.png`);
    }
  }
});

console.log('\n' + '='.repeat(50));
if (successCount > 0) {
  console.log(`\n✨ Successfully generated ${successCount} icon files!`);
  console.log('\n📱 Next steps:');
  console.log('   1. Clean build: cd android && ./gradlew clean');
  console.log('   2. Rebuild app: npx react-native run-android');
  console.log('   3. Check the app icon on your device/emulator');
} else {
  console.log('\n❌ Failed to generate icons. Please use the online tool instead.');
  console.log('   https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html');
}

