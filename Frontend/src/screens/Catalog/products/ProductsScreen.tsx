import React, {useMemo, useState} from 'react';
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
} from 'react-native';
import IconSymbol from '../../../components/IconSymbol';

interface ProductsScreenProps {
  navigation: any;
}

const ProductsScreen: React.FC<ProductsScreenProps> = ({navigation}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [collectionSheetOpen, setCollectionSheetOpen] = useState(false);
  const [collections, setCollections] = useState<string[]>(['Rfgg','Vhh']);
  const [selectedCollections, setSelectedCollections] = useState<Record<string, boolean>>({});
  const [newCollectionName, setNewCollectionName] = useState('');
  const [products, setProducts] = useState<Array<{id:string,title:string,price:number,mrp?:number,inStock:boolean}>>([
    {id:'1', title:'soap', price:50, mrp:60, inStock:false},
  ]);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'Inventory' | 'Discount' | 'Price Range'>('Inventory');
  const [inventory, setInventory] = useState<'all' | 'in' | 'out'>('all');
  const [discounts, setDiscounts] = useState<{[key: string]: boolean}>({});
  const [priceRange, setPriceRange] = useState<{min: number; max: number}>({min: 0, max: 0});
  const [sortBy, setSortBy] = useState<'title-az' | 'title-za' | 'price-low' | 'price-high' | 'disc-low' | 'disc-high'>('title-az');

  const handleAddProduct = () => {
    navigation.navigate('AddProduct');
    console.log('Navigate to Add Product screen');
  };

  const activeProduct = useMemo(() => products.find(p=>p.id===activeProductId) || null, [products, activeProductId]);

  // Compute absolute price bounds from product data
  const absoluteMinPrice = useMemo(() => {
    if (!products.length) return 0;
    const prices = products.map(p => p.price).filter(p => typeof p === 'number' && !isNaN(p) && p >= 0);
    return prices.length ? Math.min(...prices) : 0;
  }, [products]);
  
  const absoluteMaxPrice = useMemo(() => {
    if (!products.length) return 0;
    const prices = products.map(p => p.price).filter(p => typeof p === 'number' && !isNaN(p) && p >= 0);
    return prices.length ? Math.max(...prices) : 0;
  }, [products]);

  // Initialize/keep price range in bounds when products change
  React.useEffect(() => {
    if (isNaN(absoluteMinPrice) || isNaN(absoluteMaxPrice) || absoluteMinPrice < 0 || absoluteMaxPrice < 0) {
      return;
    }
    setPriceRange(prev => {
      const nextMin = prev.min === 0 && prev.max === 0 ? absoluteMinPrice : Math.min(Math.max(prev.min || 0, absoluteMinPrice), absoluteMaxPrice);
      const nextMax = prev.min === 0 && prev.max === 0 ? absoluteMaxPrice : Math.max(Math.min(prev.max || 0, absoluteMaxPrice), absoluteMinPrice);
      return {
        min: isNaN(nextMin) ? 0 : nextMin,
        max: isNaN(nextMax) ? 0 : nextMax,
      };
    });
  }, [absoluteMinPrice, absoluteMaxPrice]);

  // Helpers for discount calculation
  const getDiscountPercent = (p:{price:number; mrp?:number}) => {
    if (!p.mrp || p.mrp <= 0 || p.mrp <= p.price) return 0;
    return Math.round((1 - (p.price / p.mrp)) * 100);
  };

  // Build filtered list based on current filter state
  const filteredProducts = useMemo(() => {
    let items = products.slice();
    // Inventory filter
    if (inventory === 'in') items = items.filter(p => p.inStock);
    if (inventory === 'out') items = items.filter(p => !p.inStock);
    // Price filter
    items = items.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);
    // Discount filter
    const selectedRanges = Object.keys(discounts).filter(k => discounts[k]);
    if (selectedRanges.length) {
      items = items.filter(p => {
        const d = getDiscountPercent(p);
        return selectedRanges.some(r => {
          // r like '0 - 20%' or '81% and above'
          if (r.includes('and above')) {
            const low = parseInt(r, 10);
            if (!isNaN(low)) {
              return d >= low;
            }
            return false;
          }
          const [lo, hi] = r.replace('%','').split(' - ').map(x=>parseInt(x, 10)).filter(x => !isNaN(x));
          if (lo != null && hi != null) {
            return d >= lo && d <= hi;
          }
          return false;
        });
      });
    }
    return items;
  }, [products, inventory, priceRange, discounts]);

  // Counts for filter UI
  const inventoryCounts = useMemo(() => ({
    all: products.length,
    in: products.filter(p=>p.inStock).length,
    out: products.filter(p=>!p.inStock).length,
  }), [products]);

  const discountRanges = ['0 - 20%','21 - 40%','41 - 60%','61 - 80%','81% and above'];
  const discountCounts = useMemo(() => {
    const map: {[k:string]: number} = {};
    for (const r of discountRanges) map[r] = 0;
    for (const p of products) {
      const d = getDiscountPercent(p);
      for (const r of discountRanges) {
        if (r.includes('and above')) {
          const low = parseInt(r, 10);
          if (!isNaN(low) && d >= low) {
            map[r] += 1;
          }
        } else {
          const parts = r.replace('%','').split(' - ').map(x=>parseInt(x, 10)).filter(x => !isNaN(x));
          if (parts.length === 2 && d >= parts[0] && d <= parts[1]) {
            map[r] += 1;
            break;
          }
        }
      }
    }
    return map;
  }, [products]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <IconSymbol name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Products</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search and Filter Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <IconSymbol name="search" size={20} color="#666666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Products"
            placeholderTextColor="#999999"
          />
        </View>
        
        <View style={styles.filterButtons}>
          <TouchableOpacity style={styles.filterButton} onPress={() => setIsFilterOpen(true)}>
            <IconSymbol name="filter" size={20} color="#333333" />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.filterButton, styles.sortButton]} onPress={() => setIsSortOpen(true)}>
            <IconSymbol name="swap-vertical" size={20} color="#333333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content - Product List */}
      <ScrollView style={styles.content}>
        {filteredProducts.map(item => (
          <View key={item.id} style={styles.card}>
            <View style={styles.thumb} />
            <View style={{flex:1}}>
              <Text style={styles.title}>{item.title}</Text>
              <View style={{flexDirection:'row', alignItems:'center', gap:8}}>
                <Text style={styles.price}>₹{item.price}</Text>
                {item.mrp ? <Text style={styles.mrp}>₹{item.mrp}</Text> : null}
              </View>
              {!item.inStock && (
                <View style={styles.stockBadgeRow}>
                  <Text style={styles.outOfStockBadge}>Out of Stock</Text>
                  <TouchableOpacity onPress={() => setActionSheetOpen(true)}><Text style={styles.updateInventory}>Update Inventory</Text></TouchableOpacity>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.kebab} onPress={() => { setActiveProductId(item.id); setActionSheetOpen(true); }}>
              <IconSymbol name="ellipsis-vertical" size={18} color="#111827" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Add Product Button (bottom) */}
        <TouchableOpacity 
          style={[styles.addButton,{alignSelf:'center', marginVertical:24}]}
          onPress={handleAddProduct}>
          <Text style={styles.addButtonText}>Add New Product</Text>
        </TouchableOpacity>
        {filteredProducts.length === 0 && (
          <View style={{alignItems:'center', marginBottom:24}}>
            <Text style={{color:'#6c757d'}}>No products match your filters</Text>
          </View>
        )}
      </ScrollView>
      {/* Filter Bottom Sheet */}
      <Modal transparent visible={isFilterOpen} animationType="slide" onRequestClose={() => setIsFilterOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setIsFilterOpen(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHeaderRow}>
            <Text style={styles.sheetTitle}>Filter</Text>
            <TouchableOpacity onPress={() => { setInventory('all'); setDiscounts({}); setPriceRange({min:0,max:0}); }}>
              <Text style={styles.clearAll}>Clear All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sheetBody}>
            <View style={styles.sheetTabs}>
              {['Inventory','Discount','Price Range'].map(tab => (
                <TouchableOpacity key={tab} style={[styles.tabItem, filterTab===tab && styles.tabItemActive]} onPress={() => setFilterTab(tab as any)}>
                  <Text style={[styles.tabText, filterTab===tab && styles.tabTextActive]}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.sheetContent}>
              {filterTab==='Inventory' && (
                <>
                  {[{key:'all',label:'Show All'},{key:'in',label:'In Stock only'},{key:'out',label:'Out of Stock only'}].map(opt => (
                    <TouchableOpacity key={opt.key} style={styles.optionRow} onPress={() => setInventory(opt.key as any)}>
                      <View style={[styles.radioOuter, inventory===opt.key && styles.radioOuterActive]}>
                        {inventory===opt.key && <View style={styles.radioInner} />}
                      </View>
                      <Text style={styles.optionLabel}>{opt.label}</Text>
                      <Text style={styles.optionCount}>
                        {opt.key==='all'?inventoryCounts.all: opt.key==='in'?inventoryCounts.in: inventoryCounts.out}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}
              {filterTab==='Discount' && (
                <>
                  {discountRanges.map(r => (
                    <TouchableOpacity key={r} style={styles.optionRow} onPress={() => setDiscounts(p => ({...p,[r]:!p[r]}))}>
                      <View style={[styles.checkbox, discounts[r] && styles.checkboxChecked]} />
                      <Text style={styles.optionLabel}>{r}</Text>
                      <Text style={styles.optionCount}>{discountCounts[r] || 0}</Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}
              {filterTab==='Price Range' && (
                <>
                  <View style={styles.priceHeaderRow}>
                    <View>
                      <Text style={styles.priceHeaderLabel}>Minimum</Text>
                      <Text style={styles.priceValue}>₹{priceRange.min}</Text>
                    </View>
                    <View>
                      <Text style={styles.priceHeaderLabel}>Maximum</Text>
                      <Text style={styles.priceValue}>₹{priceRange.max}</Text>
                    </View>
                  </View>
                  <View style={styles.sliderRow}>
                    <TouchableOpacity style={styles.sliderBtn} onPress={() => setPriceRange(p=>({...p,min: Math.max(absoluteMinPrice, p.min-10)}))}><Text>-</Text></TouchableOpacity>
                    <View style={styles.sliderTrack} />
                    <TouchableOpacity style={styles.sliderBtn} onPress={() => setPriceRange(p=>({...p,max: Math.min(absoluteMaxPrice, p.max+10)}))}><Text>+</Text></TouchableOpacity>
                  </View>
                  <Text style={{color:'#6c757d', marginTop:8}}>Range from ₹{absoluteMinPrice} to ₹{absoluteMaxPrice}</Text>
                </>
              )}
            </View>
          </View>
          <TouchableOpacity style={styles.primaryCta} onPress={() => setIsFilterOpen(false)}>
            <Text style={styles.primaryCtaText}>Show All Products</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Sort Bottom Sheet */}
      <Modal transparent visible={isSortOpen} animationType="slide" onRequestClose={() => setIsSortOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setIsSortOpen(false)} />
        <View style={styles.sheet}>
          <Text style={[styles.sheetTitle,{marginBottom:10}]}>Sort By</Text>
          {[
            {key:'title-az', label:'Title(A-Z)'},
            {key:'title-za', label:'Title(Z-A)'},
            {key:'price-low', label:'Price (Low to High)'},
            {key:'price-high', label:'Price (High to Low)'},
            {key:'disc-low', label:'Discount (Low to High)'},
            {key:'disc-high', label:'Discount (High to Low)'},
          ].map(item => (
            <TouchableOpacity key={item.key} style={styles.optionRow} onPress={() => setSortBy(item.key as any)}>
              <View style={[styles.radioOuter, sortBy===item.key && styles.radioOuterActive]}>
                {sortBy===item.key && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.optionLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {/* Actions Bottom Sheet */}
      <Modal transparent visible={actionSheetOpen} animationType="slide" onRequestClose={() => setActionSheetOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setActionSheetOpen(false)} />
        <View style={styles.actionSheet}>
          {activeProduct?.inStock ? (
            <TouchableOpacity style={styles.actionRow} onPress={() => {
              setProducts(ps=>ps.map(p=>p.id===activeProductId?{...p,inStock:false}:p));
              setActionSheetOpen(false);
            }}>
              <Text style={styles.actionText}>Mark as Out of Stock</Text>
              <IconSymbol name="chevron-forward" size={18} color="#10B981" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.actionRow} onPress={() => {
              setProducts(ps=>ps.map(p=>p.id===activeProductId?{...p,inStock:true}:p));
              setActionSheetOpen(false);
            }}>
              <Text style={styles.actionText}>Mark as In Stock</Text>
              <IconSymbol name="chevron-forward" size={18} color="#10B981" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionRow} onPress={() => { setActionSheetOpen(false); setConfirmDeleteOpen(true); }}>
            <Text style={styles.actionText}>Delete</Text>
            <IconSymbol name="chevron-forward" size={18} color="#10B981" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionRow} onPress={() => { setActionSheetOpen(false); setCollectionSheetOpen(true); }}>
            <Text style={styles.actionText}>Add to Collection</Text>
            <IconSymbol name="chevron-forward" size={18} color="#10B981" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal transparent visible={confirmDeleteOpen} animationType="fade" onRequestClose={() => setConfirmDeleteOpen(false)}>
        <View style={[styles.backdrop,{justifyContent:'flex-end'}]}>
          <View style={styles.deleteCard}>
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
              <Text style={styles.sheetTitle}>Delete Product</Text>
              <TouchableOpacity onPress={() => setConfirmDeleteOpen(false)}><IconSymbol name="close" size={20} color="#6c757d"/></TouchableOpacity>
            </View>
            <Text style={styles.deleteQuestion}>Are you sure you want to delete {activeProduct?.title}?</Text>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => {
              setProducts(ps=>ps.filter(p=>p.id!==activeProductId));
              setConfirmDeleteOpen(false);
            }}>
              <Text style={styles.deleteBtnText}>Delete Product</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfirmDeleteOpen(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Select Collection Bottom Sheet */}
      <Modal transparent visible={collectionSheetOpen} animationType="slide" onRequestClose={() => setCollectionSheetOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setCollectionSheetOpen(false)} />
        <View style={styles.collectionSheet}>
          <Text style={[styles.sheetTitle,{marginBottom:8}]}>Select a Collection</Text>
          <TouchableOpacity style={styles.addCollectionRow} onPress={() => {
            if (!newCollectionName.trim()) {
              setNewCollectionName('New Collection');
            }
            const name = newCollectionName.trim();
            if (name && !collections.includes(name)) setCollections(prev=>[name,...prev]);
          }}>
            <IconSymbol name="add" size={18} color="#e61580" />
            <Text style={{color:'#e61580', marginLeft:8, fontWeight:'600'}}>Add a Collection</Text>
          </TouchableOpacity>
          {collections.map(c => (
            <TouchableOpacity key={c} style={styles.collectionRow} onPress={() => setSelectedCollections(p=>({...p,[c]:!p[c]}))}>
              <Text style={styles.collectionName}>{c}</Text>
              <View style={[styles.checkBox, selectedCollections[c] && styles.checkBoxChecked]} />
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF4FA',
  },
  header: {
    backgroundColor: '#e61580',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 30,
  },
  searchSection: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333333',
  },
  filterButtons: {
    flexDirection: 'row',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sortButton: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  content: {
    flex: 1,
  },
  card: {marginHorizontal:16, marginTop:12, backgroundColor:'#FFFFFF', borderRadius:12, padding:14, flexDirection:'row', alignItems:'center', gap:12},
  thumb: {width:60, height:60, borderRadius:8, backgroundColor:'#E5E7EB'},
  title: {fontWeight:'600', color:'#111827'},
  price: {fontWeight:'bold', color:'#111827'},
  mrp: {textDecorationLine:'line-through', color:'#9CA3AF'},
  kebab: {padding:8},
  stockBadgeRow: {marginTop:8, flexDirection:'row', alignItems:'center', justifyContent:'space-between'},
  outOfStockBadge: {backgroundColor:'#F3E8E2', color:'#6c757d', paddingVertical:6, paddingHorizontal:10, borderRadius:8},
  updateInventory: {color:'#B91C1C', fontWeight:'600'},
  addButton: {
    backgroundColor: '#e61580',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
    maxWidth: 300,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backdrop: {flex: 1, backgroundColor: 'rgba(0,0,0,0.25)'},
  sheet: {position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#FFFFFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16},
  actionSheet: {position:'absolute', left:0,right:0,bottom:0, backgroundColor:'#FFFFFF', borderTopLeftRadius:16, borderTopRightRadius:16, padding:16},
  actionRow: {flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:14},
  actionText: {color:'#111827', fontSize:16},
  sheetHeaderRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8},
  sheetTitle: {fontSize: 18, fontWeight: 'bold', color: '#111827'},
  clearAll: {color: '#9CA3AF', fontWeight: '600'},
  sheetBody: {flexDirection: 'row', minHeight: 260},
  sheetTabs: {width: 120, borderRightWidth: 1, borderRightColor: '#dee2e6'},
  tabItem: {paddingVertical: 14, paddingHorizontal: 12},
  tabItemActive: {backgroundColor: '#EEF2FF'},
  tabText: {color: '#111827'},
  tabTextActive: {fontWeight: 'bold'},
  sheetContent: {flex: 1, paddingHorizontal: 16},
  optionRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 12},
  optionLabel: {flex: 1, color: '#4B5563', fontSize: 16, marginLeft: 10},
  optionCount: {color: '#9CA3AF'},
  radioOuter: {width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#9CA3AF', justifyContent: 'center', alignItems: 'center'},
  radioOuterActive: {borderColor: '#e61580'},
  radioInner: {width: 10, height: 10, borderRadius: 5, backgroundColor: '#e61580'},
  checkbox: {width: 18, height: 18, borderRadius: 4, borderWidth: 2, borderColor: '#9CA3AF'},
  checkboxChecked: {backgroundColor: '#e61580', borderColor: '#e61580'},
  priceHeaderRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16},
  priceHeaderLabel: {color: '#6c757d', marginBottom: 6},
  priceValue: {fontWeight: 'bold', color: '#111827'},
  sliderRow: {flexDirection: 'row', alignItems: 'center'},
  sliderBtn: {width: 32, height: 32, borderRadius: 16, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center'},
  sliderTrack: {flex: 1, height: 6, backgroundColor: '#E5E7EB', marginHorizontal: 10, borderRadius: 3},
  primaryCta: {backgroundColor: '#e61580', paddingVertical: 14, borderRadius: 12, marginTop: 12},
  primaryCtaText: {color: '#FFFFFF', textAlign: 'center', fontWeight: 'bold'},
  deleteCard: {backgroundColor:'#FFFFFF', borderTopLeftRadius:16, borderTopRightRadius:16, padding:16},
  deleteQuestion: {fontSize:16, color:'#111827', marginVertical:16},
  deleteBtn: {backgroundColor:'#B91C1C', paddingVertical:14, borderRadius:12, marginBottom:10},
  deleteBtnText: {color:'#FFFFFF', textAlign:'center', fontWeight:'bold'},
  cancelBtn: {borderWidth:1, borderColor:'#CBD5E1', paddingVertical:14, borderRadius:12},
  cancelBtnText: {textAlign:'center', color:'#111827', fontWeight:'600'},
  collectionSheet: {position:'absolute', left:0, right:0, bottom:0, backgroundColor:'#FFFFFF', borderTopLeftRadius:16, borderTopRightRadius:16, padding:16, maxHeight:'70%'},
  addCollectionRow: {flexDirection:'row', alignItems:'center', paddingVertical:12},
  collectionRow: {flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:12},
  collectionName: {color:'#111827'},
  checkBox: {width:20, height:20, borderRadius:4, borderWidth:2, borderColor:'#9CA3AF'},
  checkBoxChecked: {backgroundColor:'#e61580', borderColor:'#e61580'},
});

export default ProductsScreen;

