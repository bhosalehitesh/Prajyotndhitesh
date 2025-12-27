import React from 'react';
import {View, Text, Image, StyleSheet, ImageSourcePropType} from 'react-native';

// Import the logo image - file is at: D:\night\SakhiC\Frontend\src\assets\images\logo.png.jpg
const logoImage = require('../assets/images/logo.png.jpg');

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  source?: ImageSourcePropType;
  style?: any;
}

const Logo: React.FC<LogoProps> = ({
  size = 'medium',
  showText = true,
  source,
  style,
}) => {
  const sizeMap = {
    small: {width: 56, height: 56, fontSize: 18},
    medium: {width: 80, height: 80, fontSize: 24},
    large: {width: 120, height: 120, fontSize: 32},
  };

  const dimensions = sizeMap[size];

  // Use provided source or default logo image
  const imageSource = source || logoImage;

  return (
    <View style={[styles.container, style]}>
      <Image
        source={imageSource}
        style={[
          styles.logoImage,
          {width: dimensions.width, height: dimensions.height},
        ]}
        resizeMode="contain"
      />
      {showText && (
        <Text style={[styles.logoLabel, {fontSize: Math.max(dimensions.fontSize - 8, 16)}]}>
          Sakhi
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoImage: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoPlaceholder: {
    backgroundColor: '#e61580',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  logoLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default Logo;
