import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

type IconName = 'bag' | 'tag' | 'folder' | string;

interface IconSymbolProps {
  name: IconName;
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
  'chevron-forward': 'chevron-forward',
  'filter': 'options-outline',
  'swap-vertical': 'swap-vertical',
  'ellipsis-vertical': 'ellipsis-vertical',
  'pencil': 'pencil-outline',
  'share': 'share-outline',
  'trash': 'trash-outline',
  'image': 'image-outline',
  'search': 'search',
  'close': 'close',
  'add': 'add',
  'camera': 'camera-outline',
  'camera-outline': 'camera-outline',
  'image-outline': 'image-outline',
  'chevron-down': 'chevron-down',
  'checkmark': 'checkmark',
  'logo-whatsapp': 'logo-whatsapp',
  'logo-snapchat': 'logo-snapchat',
  'people': 'people-outline',
  'chatbubble': 'chatbubble-outline',
  'globe': 'globe-outline',
  'checkmark-circle': 'checkmark-circle',
  'calendar': 'calendar-outline',
  'logo-amazon': 'logo-amazon',
  // Home screen icons
  'wallet': 'wallet-outline',
  'eye': 'eye-outline',
  'open-outline': 'open-outline',
  'storefront': 'storefront-outline',
  'palette': 'color-palette-outline',
  'card': 'card-outline',
  'car': 'car-outline',
  'help-circle': 'help-circle-outline',
  'document-text': 'document-text-outline',
  'call': 'call-outline',
  'download-outline': 'download-outline',
};

const IconSymbol: React.FC<IconSymbolProps> = ({ name, size = 18, color = '#6c757d' }) => {
  // Get the Ionicons name from mapping, or use the name directly if not mapped
  const iconName = SF_TO_IONICONS_MAPPING[name] || name;
  
  return <Ionicons name={iconName} size={size} color={color} />;
};

export default IconSymbol;
