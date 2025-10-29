import React from 'react';
import { Text, View } from 'react-native';

type IconName = 'bag' | 'tag' | 'folder' | string;

interface IconSymbolProps {
  name: IconName;
  size?: number;
  color?: string;
}

const mapToGlyph = (name: IconName) => {
  switch (name) {
    case 'bag':
      return '👜';
    case 'tag':
      return '🏷️';
    case 'folder':
      return '📁';
    default:
      return '◻️';
  }
};

const IconSymbol: React.FC<IconSymbolProps> = ({ name, size = 18, color = '#6B7280' }) => {
  return (
    <Text style={{ fontSize: size, color }}>{mapToGlyph(name)}</Text>
  );
};

export default IconSymbol;

