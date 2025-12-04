import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import IconSymbol from '../../../components/IconSymbol';
import ColorPicker from '../../../components/ColorPicker';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {uploadProductWithImages} from '../../../utils/api';

interface AddVariantScreenProps {
  navigation: any;
  route?: {
    params?: {
      baseProduct?: {
        id: string;
        title: string;
        description?: string;
        price: number;
        mrp?: number;
        businessCategory?: string;
        productCategory?: string;
        images?: string[];
      };
    };
  };
}

const AddVariantScreen: React.FC<AddVariantScreenProps> = ({
  navigation,
  route,
}) => {
  const base = route?.params?.baseProduct;

  const [images, setImages] = useState<string[]>(base?.images || []);
  const [description, setDescription] = useState(base?.description || '');
  const [mrp, setMrp] = useState(
    base?.mrp != null && !isNaN(base.mrp) ? String(base.mrp) : '',
  );
  const [price, setPrice] = useState(
    base?.price != null && !isNaN(base.price) ? String(base.price) : '',
  );
  const [color, setColor] = useState('');
  const [colorHex, setColorHex] = useState('#000000');
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState('');
  const [sku, setSku] = useState('');
  const [hsn, setHsn] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const hasColorOrSize = color.trim().length > 0 || size.trim().length > 0;
  const canSubmit =
    !!base &&
    images.length > 0 &&
    price.trim().length > 0 &&
    hasColorOrSize;

  const handleCamera = async () => {
    try {
      const res = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: false,
      });
      if (res.assets?.[0]?.uri) {
        const {fileSize, type, uri} = res.assets[0];
        if (fileSize && fileSize > 10 * 1024 * 1024) {
          Alert.alert('Image too large', 'Please select an image less than 10MB');
          return;
        }
        if (type && !/(jpeg|jpg|png|webp|gif|heic|heif)$/i.test(type)) {
          Alert.alert(
            'Unsupported format',
            'Use JPG, PNG, WEBP, GIF, HEIC, HEIF',
          );
          return;
        }
        setImages(prev => (prev.length < 6 ? [uri!, ...prev] : prev));
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
    setPickerOpen(false);
  };

  const handleGallery = async () => {
    try {
      const res = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });
      if (res.assets?.[0]?.uri) {
        const {fileSize, type, uri} = res.assets[0];
        if (fileSize && fileSize > 10 * 1024 * 1024) {
          Alert.alert('Image too large', 'Please select an image less than 10MB');
          return;
        }
        if (type && !/(jpeg|jpg|png|webp|gif|heic|heif)$/i.test(type)) {
          Alert.alert(
            'Unsupported format',
            'Use JPG, PNG, WEBP, GIF, HEIC, HEIF',
          );
          return;
        }
        setImages(prev => (prev.length < 6 ? [uri!, ...prev] : prev));
      }
    } catch (error) {
      console.error('Image library error:', error);
      Alert.alert('Error', 'Failed to open image library');
    }
    setPickerOpen(false);
  };

  const handleAddVariant = async () => {
    if (!base || !canSubmit) {
      if (!hasColorOrSize) {
        Alert.alert(
          'Add color or size',
          'You must add colour or size before adding a new variant.',
        );
      }
      return;
    }

    try {
      setSaving(true);

      await uploadProductWithImages({
        productName: base.title,
        description: description.trim() || base.description || '',
        mrp: mrp ? Number(mrp) : undefined,
        sellingPrice: Number(price),
        businessCategory: base.businessCategory,
        productCategory: base.productCategory,
        inventoryQuantity: quantity ? Number(quantity) : undefined,
        customSku: sku || undefined,
        color: color || colorHex || undefined,
        size: size || undefined,
        hsnCode: hsn || undefined,
        seoTitleTag: base.title,
        seoMetaDescription: description.trim() || base.description || '',
        imageUris: images,
      });

      Alert.alert('Success', 'Variant added successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Add variant error', error);
      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : 'Failed to add variant. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <IconSymbol name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Variant</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Image picker */}
        <View style={styles.imageRow}>
          <TouchableOpacity
            style={styles.imagePlaceholder}
            onPress={() => setPickerOpen(true)}>
            {images.length === 0 ? (
              <IconSymbol name="add" size={28} color="#6c757d" />
            ) : (
              <Image source={{uri: images[0]}} style={styles.previewImg} />
            )}
          </TouchableOpacity>
          <Text style={styles.imageHint}>
            Add upto 6 images of &lt;10mb (1 image mandatory)
          </Text>
        </View>

        {/* Base product summary */}
        {base && (
          <View style={styles.baseSummary}>
            <Text style={styles.baseLabel}>Base Product</Text>
            <Text style={styles.baseName}>{base.title}</Text>
            {base.businessCategory && (
              <Text style={styles.baseMeta}>
                {base.businessCategory} • {base.productCategory}
              </Text>
            )}
          </View>
        )}

        {/* What's Different? */}
        <Text style={styles.sectionHeader}>What's Different?</Text>
        <Text style={styles.helperBody}>
          Add colour or size information about this variant
        </Text>

        <ColorPicker
          colorName={color}
          hexCode={colorHex}
          onColorNameChange={setColor}
          onHexCodeChange={setColorHex}
          onColorChange={hex => setColorHex(hex)}
        />
        <Text style={styles.helper}>Maximum 50 characters</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter Size"
          placeholderTextColor="#9CA3AF"
          value={size}
          onChangeText={setSize}
        />
        <Text style={styles.helper}>Maximum 50 characters</Text>

        {!hasColorOrSize && (
          <View style={styles.validationBox}>
            <Text style={styles.validationText}>
              You must add colour or size before adding a new variant.
            </Text>
          </View>
        )}

        {/* Prices */}
        <View style={styles.row2}>
          <View style={styles.boxField}>
            <View style={styles.boxLeftIcon}>
              <Text style={styles.currency}>₹</Text>
            </View>
            <TextInput
              style={styles.boxInput}
              placeholder="MRP"
              placeholderTextColor="#6c757d"
              keyboardType="numeric"
              value={mrp}
              onChangeText={setMrp}
            />
          </View>
          <View style={styles.boxField}>
            <View style={styles.boxLeftIcon}>
              <Text style={styles.currency}>₹</Text>
            </View>
            <TextInput
              style={styles.boxInput}
              placeholder="Selling Price"
              placeholderTextColor="#6c757d"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>
        </View>

        {/* Inventory / SKU / Tax */}
        <Text style={styles.sectionHeader}>Inventory (Optional)</Text>
        <Text style={styles.helperBody}>Add and manage product inventory</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Available Quantity"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
        />

        <Text style={styles.sectionHeader}>Stock Keeping Unit (Optional)</Text>
        <Text style={styles.helperBody}>Add the SKU for this variant</Text>
        <TextInput
          style={styles.input}
          placeholder="SKU"
          placeholderTextColor="#9CA3AF"
          value={sku}
          onChangeText={setSku}
        />

        <Text style={styles.sectionHeader}>Tax Details (Optional)</Text>
        <Text style={styles.helperBody}>
          Enter a valid HSN code with 2, 4, 6 or 8 digits.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Enter HSN"
          placeholderTextColor="#9CA3AF"
          value={hsn}
          onChangeText={setHsn}
          maxLength={8}
        />

        <TouchableOpacity
          style={[
            styles.submitBtn,
            (!canSubmit || saving) && styles.submitBtnDisabled,
          ]}
          disabled={!canSubmit || saving}
          onPress={handleAddVariant}>
          <Text style={styles.submitText}>
            {saving ? 'Adding Variant...' : 'Add Variant'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Image Picker Modal */}
      <Modal
        transparent
        visible={pickerOpen}
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}>
        <Pressable
          style={styles.backdrop}
          onPress={() => setPickerOpen(false)}>
          <Pressable
            style={styles.sheetCard}
            onPress={e => e.stopPropagation()}>
            <View style={styles.pickRow}>
              <TouchableOpacity style={styles.pickBox} onPress={handleCamera}>
                <IconSymbol
                  name="camera-outline"
                  size={36}
                  color="#111827"
                />
                <Text style={styles.pickLabel}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pickBox} onPress={handleGallery}>
                <IconSymbol
                  name="image-outline"
                  size={36}
                  color="#111827"
                />
                <Text style={styles.pickLabel}>Gallery</Text>
              </TouchableOpacity>
            </View>
            <View style={{marginTop: 12}}>
              <Text>{'• Make sure Image size is less than 10 MB'}</Text>
              <Text>
                {
                  '• Supported formats: JPG, PNG, WEBP, GIF, HEIC, HEIF'
                }
              </Text>
              <Text>
                {
                  '• Recommended Aspect Ratio for Showcase Theme: 1:1 (600x600px)'
                }
              </Text>
              <Text>
                {
                  '• Recommended Aspect Ratio for Limelight Theme: 3:4 (600x800px)'
                }
              </Text>
              <Text>{'• Unsupported formats: SVG, MP4'}</Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FFFFFF'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {width: 30},
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    color: '#111827',
  },
  headerRight: {width: 30},
  content: {padding: 16, paddingBottom: 40},
  imageRow: {marginBottom: 16},
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#9CA3AF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImg: {width: 120, height: 120, borderRadius: 8},
  imageHint: {color: '#6c757d', marginTop: 8},
  baseSummary: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  baseLabel: {fontSize: 12, color: '#6b7280'},
  baseName: {fontSize: 16, fontWeight: '600', color: '#111827'},
  baseMeta: {fontSize: 12, color: '#6b7280', marginTop: 4},
  sectionHeader: {marginTop: 16, fontWeight: 'bold', color: '#111827'},
  helperBody: {color: '#6c757d', marginTop: 6},
  helper: {color: '#9CA3AF', marginTop: 6},
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    color: '#111827',
  },
  row2: {flexDirection: 'row', gap: 16, marginTop: 16},
  boxField: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    overflow: 'hidden',
  },
  boxLeftIcon: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRightWidth: 1,
    borderRightColor: '#dee2e6',
  },
  currency: {fontWeight: 'bold', color: '#111827'},
  boxInput: {flex: 1, paddingHorizontal: 12, color: '#111827'},
  validationBox: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  validationText: {color: '#B91C1C', fontSize: 13},
  submitBtn: {
    marginTop: 24,
    backgroundColor: '#e61580',
    padding: 14,
    borderRadius: 10,
  },
  submitBtnDisabled: {backgroundColor: '#D1D5DB'},
  submitText: {textAlign: 'center', color: '#FFFFFF', fontWeight: 'bold'},
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  sheetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  pickRow: {flexDirection: 'row', justifyContent: 'space-between'},
  pickBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  pickLabel: {marginTop: 8, fontWeight: '600', color: '#111827'},
});

export default AddVariantScreen;


