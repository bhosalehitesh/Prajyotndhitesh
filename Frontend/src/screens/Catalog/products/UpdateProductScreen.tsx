import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import IconSymbol from '../../../components/IconSymbol';
import ColorPicker from '../../../components/ColorPicker';
import {updateProduct} from '../../../utils/api';

interface UpdateProductScreenProps {
  navigation: any;
  route: {
    params?: {
      product?: {
        id: string;
        title: string;
        price: number;
        mrp?: number;
        businessCategory?: string;
        productCategory?: string;
        inStock: boolean;
      };
    };
  };
}

const UpdateProductScreen: React.FC<UpdateProductScreenProps> = ({
  navigation,
  route,
}) => {
  const p = route?.params?.product;

  const [name, setName] = useState(p?.title || '');
  const [description, setDescription] = useState('');
  const [mrp, setMrp] = useState(
    p?.mrp != null && !isNaN(p.mrp) ? String(p.mrp) : '',
  );
  const [price, setPrice] = useState(
    p?.price != null && !isNaN(p.price) ? String(p.price) : '',
  );
  const [businessCategory, setBusinessCategory] = useState(
    p?.businessCategory || '',
  );
  const [productCategory, setProductCategory] = useState(
    p?.productCategory || '',
  );
  const [quantity, setQuantity] = useState(p?.inStock ? '1' : '0');
  const [sku, setSku] = useState('');
  const [color, setColor] = useState('');
  const [colorHex, setColorHex] = useState('#000000');
  const [size, setSize] = useState('');
  const [hsn, setHsn] = useState('');
  const [saving, setSaving] = useState(false);

  const canSubmit = name.trim().length > 0 && price.trim().length > 0;

  const handleUpdate = async () => {
    if (!canSubmit || !p?.id) {
      return;
    }

    try {
      setSaving(true);
      await updateProduct(p.id, {
        productName: name.trim(),
        description: description.trim() || undefined,
        mrp: mrp ? Number(mrp) : undefined,
        sellingPrice: Number(price),
        businessCategory: businessCategory || undefined,
        productCategory: productCategory || undefined,
        inventoryQuantity: quantity ? Number(quantity) : undefined,
        customSku: sku || undefined,
        color: color || colorHex || undefined,
        size: size || undefined,
        hsnCode: hsn || undefined,
      });

      Alert.alert('Success', 'Product updated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Update product error', error);
      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : 'Failed to update product. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <IconSymbol name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Product</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>Product Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Product Name"
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName}
        />

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

        {/* Inventory */}
        <Text style={styles.sectionLabel}>Available Quantity</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Available Quantity"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
        />

        {/* SKU */}
        <Text style={styles.sectionLabel}>Stock Keeping Unit (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="SKU"
          placeholderTextColor="#9CA3AF"
          value={sku}
          onChangeText={setSku}
        />

        {/* Features */}
        <Text style={styles.sectionLabel}>Features</Text>
        <ColorPicker
          colorName={color}
          hexCode={colorHex}
          onColorNameChange={setColor}
          onHexCodeChange={setColorHex}
          onColorChange={hex => setColorHex(hex)}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter Size"
          placeholderTextColor="#9CA3AF"
          value={size}
          onChangeText={setSize}
        />

        {/* Tax */}
        <Text style={styles.sectionLabel}>Tax Details (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter HSN"
          placeholderTextColor="#9CA3AF"
          value={hsn}
          onChangeText={setHsn}
          maxLength={8}
        />

        {/* Update button */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            (!canSubmit || saving) && styles.submitBtnDisabled,
          ]}
          disabled={!canSubmit || saving}
          onPress={handleUpdate}>
          <Text style={styles.submitText}>
            {saving ? 'Updating...' : 'Update'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  sectionLabel: {fontWeight: 'bold', color: '#111827', marginTop: 12},
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    color: '#111827',
  },
  row2: {flexDirection: 'row', gap: 16, marginTop: 8},
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
  submitBtn: {marginTop: 24, backgroundColor: '#e61580', padding: 14, borderRadius: 10},
  submitBtnDisabled: {backgroundColor: '#D1D5DB'},
  submitText: {textAlign: 'center', color: '#FFFFFF', fontWeight: 'bold'},
});

export default UpdateProductScreen;


