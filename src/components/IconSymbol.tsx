import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface IconSymbolProps {
  name: string;
  size?: number;
  color?: string;
}

// SF Symbol to Ionicons mapping for all icons
const SF_TO_IONICONS_MAPPING: {[key: string]: string} = {
  // Tab bar icons
  'house.fill': 'home',
  'square.grid.2x2': 'grid',
  'chart.bar.fill': 'bar-chart',
  
  // Catalog icons
  'list.bullet': 'list',
  'heart': 'heart',
  'plus': 'add',
  'magnifyingglass': 'search',
  'person': 'person',
  
  // Custom icons for Catalog
  'shopping-bag': 'bag-outline',
  'tag-icon': 'pricetag-outline',
  'folder-icon': 'folder-outline',
  
  // Products, Categories, Collections icons
  'bag': 'bag-outline',
  'tag': 'pricetag-outline',
  'folder': 'folder-outline',
  
  // Navigation and UI icons
  'chevron-back': 'chevron-back',
  'filter': 'options-outline',
  'swap-vertical': 'swap-vertical',
};

const IconSymbol: React.FC<IconSymbolProps> = ({
  name,
  size = 24,
  color = '#333333',
}) => {
  // Get the Ionicons name
  const ioniconsName = SF_TO_IONICONS_MAPPING[name] || name;

  return (
    <Ionicons 
      name={ioniconsName as any}
      size={size}
      color={color}
    />
  );
};

export default IconSymbol;
