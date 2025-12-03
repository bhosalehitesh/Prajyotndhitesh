import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Dimensions,
  TextInput,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLOR_WHEEL_SIZE = Math.min(SCREEN_WIDTH - 80, 250);

interface ColorPickerProps {
  colorName: string;
  hexCode: string;
  onColorNameChange: (name: string) => void;
  onHexCodeChange: (hex: string) => void;
  onColorChange: (hex: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  colorName,
  hexCode,
  onColorNameChange,
  onHexCodeChange,
  onColorChange,
}) => {
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);

  const wheelRef = useRef<View>(null);
  const sliderRef = useRef<View>(null);

  // HSL to Hex conversion
  const hslToHex = (h: number, s: number, l: number): string => {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `#${[r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('')}`;
  };

  // Hex to HSL conversion
  const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
    if (!hex || hex.length !== 7 || !hex.match(/^#[0-9A-Fa-f]{6}$/)) {
      return { h: 0, s: 100, l: 50 };
    }
    
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  // Initialize from hex code on mount only
  const [hasInitialized, setHasInitialized] = useState(false);
  useEffect(() => {
    if (!hasInitialized && hexCode && hexCode.length === 7 && hexCode.match(/^#[0-9A-Fa-f]{6}$/)) {
      const hsl = hexToHsl(hexCode);
      setHue(hsl.h);
      setSaturation(hsl.s);
      setLightness(hsl.l);
      setHasInitialized(true);
    } else if (!hasInitialized) {
      setHasInitialized(true);
    }
  }, [hexCode, hasInitialized]);

  // Update hex code when HSL changes
  useEffect(() => {
    const hex = hslToHex(hue, saturation, lightness).toUpperCase();
    const currentHexUpper = hexCode ? hexCode.toUpperCase() : '';
    if (hex !== currentHexUpper) {
      onHexCodeChange(hex);
      onColorChange(hex);
    }
  }, [hue, saturation, lightness, hexCode, onHexCodeChange, onColorChange]);

  const currentHex = hslToHex(hue, saturation, lightness);

  // Handle hex code input
  const handleHexCodeChange = (text: string) => {
    const cleaned = text.replace(/[^0-9A-Fa-f#]/g, '').replace(/^#?/, '#').slice(0, 7);
    onHexCodeChange(cleaned);
    
    if (cleaned.length === 7 && cleaned.match(/^#[0-9A-Fa-f]{6}$/)) {
      const hsl = hexToHsl(cleaned);
      setHue(hsl.h);
      setSaturation(hsl.s);
      setLightness(hsl.l);
      onColorChange(cleaned.toUpperCase());
    }
  };

  // Get handle position on color wheel
  const getColorWheelPosition = () => {
    const center = COLOR_WHEEL_SIZE / 2;
    const radius = COLOR_WHEEL_SIZE / 2 - 20;
    const innerRadius = 30;
    const angle = (hue * Math.PI) / 180;
    const dist = innerRadius + ((saturation / 100) * (radius - innerRadius));
    return {
      x: center + Math.cos(angle) * dist - 10,
      y: center + Math.sin(angle) * dist - 10,
    };
  };

  // Get slider handle position
  const getSliderPosition = () => {
    const sliderWidth = COLOR_WHEEL_SIZE - 40;
    return (lightness / 100) * sliderWidth;
  };

  // Update color from wheel touch
  const updateWheelColor = (x: number, y: number) => {
    const center = COLOR_WHEEL_SIZE / 2;
    const dx = x - center;
    const dy = y - center;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = COLOR_WHEEL_SIZE / 2 - 20;
    const minRadius = 30;

    if (distance <= maxRadius) {
      const angle = Math.atan2(dy, dx);
      let newHue = (angle * 180) / Math.PI;
      if (newHue < 0) newHue += 360;
      
      if (distance < minRadius) {
        setSaturation(0);
      } else {
        const newSaturation = ((distance - minRadius) / (maxRadius - minRadius)) * 100;
        setSaturation(Math.min(100, Math.max(0, newSaturation)));
      }
      setHue(newHue);
    } else if (distance > maxRadius) {
      // If outside, clamp to edge
      const angle = Math.atan2(dy, dx);
      let newHue = (angle * 180) / Math.PI;
      if (newHue < 0) newHue += 360;
      setHue(newHue);
      setSaturation(100);
    }
  };

  // Update lightness from slider touch
  const updateSliderColor = (x: number) => {
    const sliderWidth = COLOR_WHEEL_SIZE - 40;
    const clampedX = Math.max(0, Math.min(sliderWidth, x));
    const newLightness = (clampedX / sliderWidth) * 100;
    setLightness(newLightness);
  };

  // PanResponder for color wheel
  const wheelPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        updateWheelColor(locationX, locationY);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        updateWheelColor(locationX, locationY);
      },
      onPanResponderRelease: () => {
        // Handle release if needed
      },
    })
  ).current;

  // PanResponder for slider
  const sliderPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX } = evt.nativeEvent;
        updateSliderColor(locationX);
      },
      onPanResponderMove: (evt) => {
        const { locationX } = evt.nativeEvent;
        updateSliderColor(locationX);
      },
      onPanResponderRelease: () => {
        // Handle release if needed
      },
    })
  ).current;

  // Render color wheel with smooth gradient
  const renderColorWheel = () => {
    const center = COLOR_WHEEL_SIZE / 2;
    const outerRadius = COLOR_WHEEL_SIZE / 2 - 20;
    const innerRadius = 30;
    const pos = getColorWheelPosition();
    const numRings = 12;
    const segmentsPerRing = 72;

    const colorSegments: JSX.Element[] = [];

    for (let ring = 0; ring < numRings; ring++) {
      const ringRadius = innerRadius + ((outerRadius - innerRadius) / numRings) * ring;
      const nextRingRadius = innerRadius + ((outerRadius - innerRadius) / numRings) * (ring + 1);
      const ringWidth = nextRingRadius - ringRadius;
      
      for (let seg = 0; seg < segmentsPerRing; seg++) {
        const angle = (seg * 360) / segmentsPerRing;
        const nextAngle = ((seg + 1) * 360) / segmentsPerRing;
        const midAngle = (angle + nextAngle) / 2;
        
        const sat = Math.min(100, ((ringRadius - innerRadius) / (outerRadius - innerRadius)) * 100);
        const color = hslToHex(midAngle, sat, 50);
        
        const midAngleRad = (midAngle * Math.PI) / 180;
        const midRadius = (ringRadius + nextRingRadius) / 2;
        const segmentX = center + Math.cos(midAngleRad) * midRadius - ringWidth / 2;
        const segmentY = center + Math.sin(midAngleRad) * midRadius - ringWidth / 2;
        
        const segmentSize = ringWidth * 1.8;
        
        colorSegments.push(
          <View
            key={`${ring}-${seg}`}
            style={[
              styles.colorSegment,
              {
                backgroundColor: color,
                width: segmentSize,
                height: segmentSize,
                borderRadius: segmentSize / 2,
                left: segmentX,
                top: segmentY,
                opacity: ring < 3 ? 0.65 : 0.9,
              },
            ]}
            pointerEvents="none"
          />
        );
      }
    }

    return (
      <View style={styles.wheelContainer}>
        <View
          ref={wheelRef}
          style={styles.colorWheel}
          {...wheelPanResponder.panHandlers}
        >
          {colorSegments}
          <View style={styles.wheelCenter} />
          <View style={[styles.wheelHandle, { left: pos.x, top: pos.y }]} />
        </View>
      </View>
    );
  };

  // Render grayscale slider
  const renderSlider = () => {
    const pos = getSliderPosition();
    const leftColor = hslToHex(hue, saturation, 0);
    const rightColor = hslToHex(hue, saturation, 100);

    return (
      <View style={styles.sliderContainer}>
        <View
          ref={sliderRef}
          style={styles.sliderTrack}
          {...sliderPanResponder.panHandlers}
        >
          <View style={[styles.sliderGradientLeft, { backgroundColor: leftColor }]} />
          <View style={[styles.sliderGradientRight, { backgroundColor: rightColor }]} />
          <View style={[styles.sliderHandle, { left: pos }]} />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Color</Text>
      
      <Text style={styles.inputLabel}>Color Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Color Name"
        placeholderTextColor="#9CA3AF"
        value={colorName}
        onChangeText={onColorNameChange}
        maxLength={50}
      />

      {renderColorWheel()}
      {renderSlider()}

      <Text style={styles.inputLabel}>Hex-code</Text>
      <TextInput
        style={styles.input}
        placeholder="Hex-code"
        placeholderTextColor="#9CA3AF"
        value={hexCode}
        onChangeText={handleHexCodeChange}
        maxLength={7}
        autoCapitalize="characters"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    color: '#111827',
    fontSize: 16,
  },
  wheelContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  colorWheel: {
    width: COLOR_WHEEL_SIZE,
    height: COLOR_WHEEL_SIZE,
    borderRadius: COLOR_WHEEL_SIZE / 2,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
  },
  colorSegment: {
    position: 'absolute',
  },
  wheelCenter: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    top: COLOR_WHEEL_SIZE / 2 - 30,
    left: COLOR_WHEEL_SIZE / 2 - 30,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    pointerEvents: 'none',
  },
  wheelHandle: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 2000,
    pointerEvents: 'none',
  },
  sliderContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  sliderTrack: {
    width: COLOR_WHEEL_SIZE - 40,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E5E7EB',
    position: 'relative',
    overflow: 'hidden',
  },
  sliderGradientLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '50%',
    height: '100%',
  },
  sliderGradientRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: '50%',
    height: '100%',
  },
  sliderHandle: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#111827',
    top: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    pointerEvents: 'none',
  },
});

export default ColorPicker;
