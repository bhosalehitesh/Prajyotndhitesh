import React, {useState, useEffect, useRef} from 'react';
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
  PermissionsAndroid,
} from 'react-native';
import IconSymbol from '../../../components/IconSymbol';
import {launchCamera, launchImageLibrary, CameraOptions, ImagePickerResponse} from 'react-native-image-picker';
import ViewShot, {captureRef} from 'react-native-view-shot';

interface AddProductScreenProps {
  navigation: any;
}

const AddProductScreen: React.FC<AddProductScreenProps> = ({navigation}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [mrp, setMrp] = useState('');
  const [price, setPrice] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [sku, setSku] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [hsn, setHsn] = useState('');
  const [bestSeller, setBestSeller] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [productCategoryOpen, setProductCategoryOpen] = useState(false);
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [shotUri, setShotUri] = useState<string | null>(null);
  const screenShotRef = useRef<ViewShot | null>(null);

  const categoryList = [
    'Appliances','Baby','Beauty and Personal Care','Books and Stationery','Clothing','Electronics','Food and Grocery','Footwear','Furniture','General','Health Supplements','Home and Kitchen','Home Care','Jewelry','Lawn and Garden','Luggage and Bags','Multipurpose','Pet Products','Sports and Fitness','Toys and games','Watches',
  ];

  const productCategoryMap: Record<string, string[]> = {
    'Appliances': ['Air Conditioners','Microwave & Oven','Other Appliances','Refrigerators','Small Kitchen Appliances','Televisions','Washing machines'],
    'Baby': ['Baby Bath and skin care','Baby Clothing and accessories','Baby Stroller & Gear','Baby toys & playtime','Bedding and Nursery','Diapers and accessories','Feeding','Other Baby products'],
    'Beauty and Personal Care': ['Covid essentials','Feminine Hygiene','Fragrance','Grooming appliances','Hair care','Health & Wellness','Make up and nails','Oral Care','Other Beauty and Personal Care','Personal care Appliances','Skin care'],
    'Books and Stationery': ['Art & Craft supplies','Calculators & organizers','Children\'s books','Entrance exam books','Files & Folders','Literature & Fiction books','Non fiction books','Notebooks & Diaries','Office products','Other Books & Stationery','School textbooks & guides','Writing supplies'],
    'Clothing': ["Dresses & Jumpsuits","Kid's clothing","Kurtis & Salwar Suits","Men's Casual Wear","Men's Formal Wear","Men's Indian Wear","Men's Innerwear and Loungewear","Men's Jeans and Trousers","Men's Sports Clothing","Men's T-shirts & Polos","Men's Winterwear","Other Clothing","Saree","Women's Indian wear","Women's Innerwear & Loungewear","Women's Jeans and Trousers","Women's Skirts & Shorts","Women's Tops, Tees & Shirts"],
    'Electronics': ['Cameras','Computer & Phone accessories','Laptops, Desktops & Tablets','Mobile','Other Electronics','Speakers & Headphones'],
    'Food and Grocery': ['Appetizers','Baby food','Bakery','Beverages','Chocolates and ice-cream','Dairy','Desserts','Eggs, Meat & Seafood','Food grains, Oil & Masala','Fruits & Vegetables','Gourmet Food','Health food','Instant Food','Mains','Mithai (Indian Sweets)','Namkeen, Snacks & Biscuits','Other Food and Grocery','Pet food'],
    'Footwear': ["Heels","Kid's footwear","Men's Casual Shoes","Men's Flip flops & Sandals","Men's Formal Shoes","Men's Sports shoes","Other Footwear","Women's Casual shoes","Women's Flipflops & Sandals","Women's Sport shoes"],
    'Furniture': ['Bedroom furniture','Dining furniture','Living room furniture','Other furniture','Outdoor furniture','Study furniture','Wardrobes'],
    'General': ['Assorted'],
    'Health Supplements': ['Herbal Supplements & Ayurveda','Other health supplements','Probiotics','Proteins & Immunity Boosters','Vitamins & Minerals'],
    'Home and Kitchen': ['Bedding','Candles','Home & Bath Linen','Home Decor','Home storage and Organization','Kitchen & Dining','Kitchen Linen','Lighting','Other Home and Kitchen'],
    'Home Care': ['Dishwashing supplies','Freshener & Repellents','Kitchen & Surface cleaners','Laundry detergents','Mops, Brushes & Scrubs','Other Home Care','Pooja essentials','Toilet cleaners'],
    'Jewelry': ['Bangles & Bracelets','Earrings','Hair accessories','Necklace and Jewellery Sets','Other Jewelry','Rings'],
    'Lawn and Garden': ['Barbeque','Fertilizer and Soil','Gardening Tools','Live Plants','Other Lawn and Garden items','Outdoor Decor','Pots and Planters','Seeds','Solar Lamps and Lights','Watering Equipment'],
    'Luggage and Bags': ['Backpacks','Duffel Bags','Handbags & Clutches','Laptop bags','Other Luggage & Bags','School bags','Suitcases & trolleys','Wallets'],
    'Multipurpose': ['Assorted'],
    'Pet Products': ['Bird nest and cages','Fish Aquarium & Accessories','Pet Care and Grooming','Pet Clothing','Pet Dens, beds and feeders','Pet Food','Pet Toys'],
    'Sports and Fitness': ['Badminton','Camping & Hiking','Cricket','Cycling','Excercise & Fitness','Football','Indoor Sports','Other Sports products','Yoga'],
    'Toys and games': ['Games','Other Toys and games','Puzzles','Toys'],
    'Watches': ["Men's watches","Other Watches","Smartwatches","Women's watches"],
  };

  useEffect(() => {
    // Reset product category when business category changes
    setProductCategory('');
  }, [businessCategory]);

  const canSubmit = name.trim().length > 0 && price.trim().length > 0;

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs access to your camera to take photos',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const handleCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant camera permission to take photos');
      return;
    }

    try {
      const res = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: false,
      });
      
      if (res.didCancel) {
        console.log('User cancelled camera picker');
      } else if (res.errorCode) {
        console.log('ImagePicker Error: ', res.errorMessage);
        Alert.alert('Error', res.errorMessage || 'Failed to open camera');
      } else if (res.assets?.[0]?.uri) {
        const {fileSize, type, uri} = res.assets[0];
        if (fileSize && fileSize > 10 * 1024 * 1024) {
          Alert.alert('Image too large', 'Please select an image less than 10MB');
          return;
        }
        if (type && !/(jpeg|jpg|png|webp|gif|heic|heif)$/i.test(type)) {
          Alert.alert('Unsupported format', 'Use JPG, PNG, WEBP, GIF, HEIC, HEIF');
          return;
        }
        setImages(prev => prev.length < 6 ? [uri!, ...prev] : prev);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
    setPickerOpen(false);
  };

  const handleScreenshot = async () => {
    try {
      const uri = await captureRef(screenShotRef, {format: 'jpg', quality: 0.9} as any);
      if (uri) {
        setShotUri(uri as string);
        Alert.alert('Screenshot captured', 'Preview added to the first image slot.');
        setImages(prev => prev.length < 6 ? [uri as string, ...prev] : prev);
      }
    } catch (e) {
      console.warn('ViewShot error', e);
      Alert.alert('Error', 'Unable to capture screenshot');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <IconSymbol name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Product</Text>
        <TouchableOpacity style={styles.headerRight} onPress={handleScreenshot}>
          <IconSymbol name="download-outline" size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      <ViewShot ref={screenShotRef} style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Image picker placeholder */}
        <View style={styles.imageRow}>
          <TouchableOpacity style={styles.imagePlaceholder} onPress={() => setPickerOpen(true)}>
            {images.length === 0 ? (
              <IconSymbol name="add" size={28} color="#6c757d" />
            ) : (
              <Image source={{uri: images[0]}} style={styles.previewImg} />
            )}
          </TouchableOpacity>
          <Text style={styles.imageHint}>Add upto 6 images of &lt;10mb (1 image mandatory)</Text>
        </View>

        {/* Product Name */}
        <Text style={styles.sectionLabel}>Product Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Product Name"
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName}
        />
        <Text style={styles.helper}>Maximum 200 characters</Text>

        {/* Product Description */}
        <Text style={styles.sectionLabel}>Product Description <Text style={styles.optional}>(Optional)</Text></Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Press here to type"
          placeholderTextColor="#9CA3AF"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <Text style={styles.helper}>Maximum 2000 characters</Text>

        {/* Prices */}
        <View style={styles.row2}>
          <View style={styles.boxField}>
            <View style={styles.boxLeftIcon}><Text style={styles.currency}>₹</Text></View>
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
            <View style={styles.boxLeftIcon}><Text style={styles.currency}>₹</Text></View>
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

        {/* Business Category */}
        <TouchableOpacity style={styles.dropdown} onPress={() => setCategoryOpen(true)}>
          <Text style={{color: businessCategory ? '#111827' : '#6c757d'}}>
            {businessCategory || 'Business Category'}
          </Text>
        </TouchableOpacity>

        {/* Product Category */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => {
            if (!businessCategory) {
              Alert.alert('Select Business Category', 'Please choose a business category first');
              return;
            }
            setProductCategoryOpen(true);
          }}
        >
          <Text style={{color: productCategory ? '#111827' : '#6c757d'}}>
            {productCategory || 'Product Category'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addSecondary} onPress={() => setNewCategoryOpen(true)}>
          <IconSymbol name="add" size={18} color="#e61580" />
          <Text style={styles.addSecondaryText}>Add New Product Category</Text>
        </TouchableOpacity>

        {/* Size Chart + Image guidelines */}
        <Text style={styles.subTitle}>Size Chart <Text style={styles.optional}>(Optional)</Text></Text>
        <TouchableOpacity style={styles.uploadBtn} onPress={() => setPickerOpen(true)}>
          <IconSymbol name="add" size={18} color="#111827" />
          <Text style={styles.uploadText}>Upload</Text>
        </TouchableOpacity>
        <View style={styles.guidelineCard}>
          <Text style={styles.guidelineTitle}>Image Guidelines:</Text>
          <Text style={styles.guidelineBody}>Recommended Minimum Width for Size Chart: 800px</Text>
        </View>

        {/* Inventory */}
        <Text style={styles.sectionHeader}>Inventory <Text style={styles.optional}>(Optional)</Text></Text>
        <Text style={styles.helperBody}>Add and manage product inventory</Text>
        <TextInput style={styles.input} placeholder="Enter Available Quantity" placeholderTextColor="#9CA3AF" keyboardType="numeric" value={quantity} onChangeText={setQuantity} />

        {/* SKU */}
        <Text style={styles.sectionHeader}>Stock Keeping Unit <Text style={styles.optional}>(Optional)</Text></Text>
        <Text style={styles.helperBody}>Add the SKU for this product</Text>
        <TextInput style={styles.input} placeholder="SKU" placeholderTextColor="#9CA3AF" value={sku} onChangeText={setSku} />
        <Text style={styles.helper}>Maximum 40 characters</Text>

        {/* Features */}
        <Text style={styles.sectionHeader}>Features</Text>
        <Text style={styles.helperBody}>Add color and size information about this product</Text>
        <TextInput style={styles.input} placeholder="Select Color" placeholderTextColor="#9CA3AF" value={color} onChangeText={setColor} />
        <Text style={styles.helper}>Maximum 50 characters</Text>
        <TextInput style={styles.input} placeholder="Enter Size" placeholderTextColor="#9CA3AF" value={size} onChangeText={setSize} />
        <Text style={styles.helper}>Maximum 50 characters</Text>

        {/* Variants / Tax */}
        <Text style={styles.sectionHeader}>Variants</Text>
        <Text style={styles.helperBody}>Add different size and color options</Text>
        <TouchableOpacity style={styles.addSecondary}><IconSymbol name="add" size={18} color="#e61580" /><Text style={styles.addSecondaryText}>Add New Variant</Text></TouchableOpacity>

        <Text style={styles.sectionHeader}>Tax Details <Text style={styles.optional}>(Optional)</Text></Text>
        <Text style={styles.helperBody}>Enter a valid HSN code with 2, 4, 6 or 8 digits.</Text>
        <TouchableOpacity><Text style={styles.link}>List of HSN Codes</Text></TouchableOpacity>
        <TextInput style={styles.input} placeholder="Enter HSN" placeholderTextColor="#9CA3AF" value={hsn} onChangeText={setHsn} maxLength={8} />

        {/* Best Seller */}
        <TouchableOpacity style={styles.checkRow} onPress={() => setBestSeller(!bestSeller)}>
          <View style={[styles.checkbox, bestSeller && styles.checkboxChecked]} />
          <Text style={styles.checkLabel}>Mark as Best Seller</Text>
        </TouchableOpacity>

        {/* Submit */}
        <TouchableOpacity style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]} disabled={!canSubmit}>
          <Text style={styles.submitText}>Add Product</Text>
        </TouchableOpacity>
      </ScrollView>
      </ViewShot>

      {/* Image Picker Modal */}
      <Modal transparent visible={pickerOpen} animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.centerOverlay}>
          <View style={styles.sheetCard}>
            <View style={styles.pickRow}>
              <TouchableOpacity style={styles.pickBox} onPress={handleCamera}>
                <IconSymbol name="camera-outline" size={36} color="#111827" />
                <Text style={styles.pickLabel}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pickBox} onPress={async () => {
                const res = await launchImageLibrary({mediaType:'photo',selectionLimit:1,quality:0.8});
                if (res.assets?.[0]?.uri) {
                  const {fileSize, type, uri} = res.assets[0];
                  if (fileSize && fileSize > 10 * 1024 * 1024) { Alert.alert('Image too large','Please select an image less than 10MB'); return; }
                  if (type && !/(jpeg|jpg|png|webp|gif|heic|heif)$/i.test(type)) { Alert.alert('Unsupported format','Use JPG, PNG, WEBP, GIF, HEIC, HEIF'); return; }
                  setImages(prev => prev.length < 6 ? [uri!, ...prev] : prev);
                }
                setPickerOpen(false);
              }}>
                <IconSymbol name="image-outline" size={36} color="#111827" />
                <Text style={styles.pickLabel}>Gallery</Text>
              </TouchableOpacity>
            </View>
            <View style={{marginTop: 12}}>
              <Text>{'• Make sure Image size is less than  10 MB'}</Text>
              <Text>{'• Supported formats: JPG, PNG, WEBP, GIF, HEIC, HEIF'}</Text>
              <Text>{'• Recommended Aspect Ratio for Showcase Theme: 1:1 (600x600px)'}</Text>
              <Text>{'• Recommended Aspect Ratio for Limelight Theme: 3:4 (600x800px)'}</Text>
              <Text>{'• Unsupported formats: SVG, MP4'}</Text>
            </View>
            <TouchableOpacity style={styles.modalClose} onPress={() => setPickerOpen(false)}>
              <Text style={{fontWeight:'bold', fontSize: 28}}>×</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Business Category Modal */}
      <Modal transparent visible={categoryOpen} animationType="slide" onRequestClose={() => setCategoryOpen(false)}>
        <View style={styles.centerOverlay}>
          <View style={styles.listCard}>
            <View style={styles.listHeader}> 
              <Text style={styles.listTitle}>Business Category</Text>
              <TouchableOpacity onPress={() => setCategoryOpen(false)}><Text style={{fontSize:28, fontWeight:'bold'}}>×</Text></TouchableOpacity>
            </View>
            <ScrollView>
              {categoryList.map(item => (
                <TouchableOpacity key={item} style={styles.listItem} onPress={() => { setBusinessCategory(item); setCategoryOpen(false); }}>
                  <Text style={styles.listItemText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Product Category Modal */}
      <Modal transparent visible={productCategoryOpen} animationType="slide" onRequestClose={() => setProductCategoryOpen(false)}>
        <View style={styles.centerOverlay}>
          <View style={styles.listCard}>
            <View style={styles.listHeader}> 
              <Text style={styles.listTitle}>Product Category</Text>
              <TouchableOpacity onPress={() => setProductCategoryOpen(false)}><Text style={{fontSize:28, fontWeight:'bold'}}>×</Text></TouchableOpacity>
            </View>
            <ScrollView>
              {(productCategoryMap[businessCategory] || []).map(item => (
                <TouchableOpacity key={item} style={styles.listItem} onPress={() => { setProductCategory(item); setProductCategoryOpen(false); }}>
                  <Text style={styles.listItemText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Create Category Modal */}
      <Modal transparent visible={newCategoryOpen} animationType="slide" onRequestClose={() => setNewCategoryOpen(false)}>
        <View style={styles.centerOverlay}>
          <View style={styles.createCategoryCard}>
            <Text style={styles.createCategoryTitle}>Create a Category</Text>
            
            <View style={{marginTop: 16}}>
              <Text style={styles.categoryLabel}>Category Name*</Text>
              <TextInput
                style={styles.categoryInput}
                placeholder="Enter Category Name"
                placeholderTextColor="#9CA3AF"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                maxLength={30}
              />
              <Text style={{textAlign: 'right', color: '#9CA3AF', marginTop: 4}}>
                {newCategoryName.length}/30
              </Text>
            </View>

            <View style={styles.createCategoryButtons}>
              <TouchableOpacity
                style={[styles.createCategoryBtn, !newCategoryName.trim() && styles.createCategoryBtnDisabled]}
                onPress={() => {
                  if (newCategoryName.trim()) {
                    setProductCategory(newCategoryName.trim());
                    setNewCategoryName('');
                    setNewCategoryOpen(false);
                    Alert.alert('Success', 'Category added successfully');
                  }
                }}
                disabled={!newCategoryName.trim()}
              >
                <Text style={[styles.createCategoryBtnText, !newCategoryName.trim() && styles.createCategoryBtnTextDisabled]}>
                  Add Category
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FFFFFF'},
  header: {flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB'},
  backButton: {width: 30},
  headerTitle: {flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 18, color: '#111827'},
  headerRight: {width: 30},

  content: {padding: 16, paddingBottom: 40},
  imageRow: {marginBottom: 16},
  imagePlaceholder: {width: 120, height: 120, borderWidth: 1, borderStyle: 'dashed', borderColor: '#9CA3AF', borderRadius: 8, alignItems: 'center', justifyContent: 'center'},
  previewImg: {width: 120, height: 120, borderRadius: 8},
  imageHint: {color: '#6c757d', marginTop: 8},

  sectionLabel: {fontWeight: 'bold', color: '#111827', marginTop: 12},
  optional: {color: '#9CA3AF', fontWeight: 'normal'},
  input: {borderWidth: 1, borderColor: '#dee2e6', borderRadius: 8, padding: 12, marginTop: 8, color: '#111827'},
  textarea: {height: 160, textAlignVertical: 'top'},
  helper: {color: '#9CA3AF', marginTop: 6},
  helperBody: {color: '#6c757d', marginTop: 6},

  row2: {flexDirection: 'row', gap: 16, marginTop: 8},
  boxField: {flex: 1, flexDirection: 'row', borderWidth: 1, borderColor: '#dee2e6', borderRadius: 8, overflow: 'hidden'},
  boxLeftIcon: {width: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', borderRightWidth: 1, borderRightColor: '#dee2e6'},
  currency: {fontWeight: 'bold', color: '#111827'},
  boxInput: {flex: 1, paddingHorizontal: 12, color: '#111827'},

  dropdown: {borderWidth: 1, borderColor: '#dee2e6', borderRadius: 8, padding: 12, marginTop: 12, color: '#111827'},
  addSecondary: {marginTop: 10, borderWidth: 1, borderColor: '#C7F2F9', backgroundColor: '#ECFEFF', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 8},
  addSecondaryText: {color: '#e61580', fontWeight: '600'},

  subTitle: {marginTop: 16, fontWeight: 'bold', color: '#111827'},
  uploadBtn: {marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#dee2e6', borderRadius: 8, padding: 12, alignSelf: 'flex-start'},
  uploadText: {color: '#111827'},
  guidelineCard: {marginTop: 12, padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8},
  guidelineTitle: {fontWeight: '600', marginBottom: 4, color: '#111827'},
  guidelineBody: {color: '#6c757d'},

  sectionHeader: {marginTop: 18, fontWeight: 'bold', color: '#111827'},

  link: {color: '#e61580', marginTop: 6},
  checkRow: {flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12},
  checkbox: {width: 18, height: 18, borderRadius: 4, borderWidth: 2, borderColor: '#9CA3AF'},
  checkboxChecked: {backgroundColor: '#e61580', borderColor: '#e61580'},
  checkLabel: {color: '#111827'},

  submitBtn: {marginTop: 16, backgroundColor: '#e61580', padding: 14, borderRadius: 10},
  submitBtnDisabled: {backgroundColor: '#D1D5DB'},
  submitText: {textAlign: 'center', color: '#FFFFFF', fontWeight: 'bold'},

  // Modals
  centerOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 16},
  sheetCard: {backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, width: '100%'},
  pickRow: {flexDirection:'row', justifyContent: 'space-between'},
  pickBox: {flex:1, borderWidth:1, borderColor:'#E5E7EB', borderRadius:8, padding:16, alignItems:'center', marginHorizontal:6},
  pickLabel: {marginTop:8, fontWeight:'600', color:'#111827'},
  modalClose: {position:'absolute', top:8, right:12},

  listCard: {backgroundColor:'#FFFFFF', borderRadius:12, paddingBottom:8, width:'100%', maxHeight:'80%'},
  listHeader: {flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:14, backgroundColor:'#111827', borderTopLeftRadius:12, borderTopRightRadius:12},
  listTitle: {color:'#FFFFFF', fontWeight:'600'},
  listItem: {paddingHorizontal:16, paddingVertical:14, borderBottomWidth:1, borderBottomColor:'#dee2e6'},
  listItemText: {color:'#111827', fontSize:16},

  // Create Category Modal
  createCategoryCard: {backgroundColor:'#FFFFFF', borderRadius:12, padding:20, width:'90%'},
  createCategoryTitle: {fontSize:18, fontWeight:'bold', color:'#111827'},
  categoryLabel: {fontWeight:'600', color:'#111827', marginBottom:8},
  categoryInput: {borderWidth:1, borderColor:'#E5E7EB', borderRadius:8, padding:12, color:'#111827'},
  createCategoryButtons: {marginTop:20, gap:12},
  createCategoryBtn: {backgroundColor:'#e61580', padding:14, borderRadius:8, alignItems:'center'},
  createCategoryBtnDisabled: {backgroundColor:'#D1D5DB'},
  createCategoryBtnText: {color:'#FFFFFF', fontWeight:'bold'},
  createCategoryBtnTextDisabled: {color:'#9CA3AF'},
});

export default AddProductScreen;


