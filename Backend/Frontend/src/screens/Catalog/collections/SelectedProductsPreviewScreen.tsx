import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Image,
} from 'react-native';
import IconSymbol from '../../../components/IconSymbol';

interface SelectedProductsPreviewScreenProps {
    navigation: any;
    route?: any;
}

const SelectedProductsPreviewScreen: React.FC<SelectedProductsPreviewScreenProps> = ({
    navigation,
    route,
}) => {
    // Get products passed from AddCollection
    const initialProducts = route?.params?.selectedProducts || [];
    const [products, setProducts] = useState<any[]>(initialProducts);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialProducts.map((p: any) => p.id)));

    // Sync state if params change (optional, mostly for initial load)
    useEffect(() => {
        if (route?.params?.selectedProducts) {
            const initial = route.params.selectedProducts;
            setProducts(initial);
            setSelectedIds(new Set(initial.map((p: any) => p.id)));
        }
    }, [route?.params?.selectedProducts]);


    const toggleSelection = (id: string) => {
        const newSelectedWithIds = new Set(selectedIds);
        if (newSelectedWithIds.has(id)) {
            newSelectedWithIds.delete(id);
        } else {
            newSelectedWithIds.add(id);
        }
        setSelectedIds(newSelectedWithIds);
    };

    const handleSave = () => {
        // Filter products based on selectedIds
        const finalSelection = products.filter((p: any) => selectedIds.has(p.id));

        const returnScreen = route?.params?.returnScreen || 'AddCollection';
        const returnParams = route?.params?.returnParams || {};

        // Navigate back to the caller with updated list and preserved state
        navigation.navigate(returnScreen, {
            ...returnParams,
            selectedProducts: finalSelection,
            refreshTimestamp: Date.now(), // Signal update
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}>
                    <IconSymbol name="chevron-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Preview Products</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.content}>
                {products.map((item: any) => {
                    const isSelected = selectedIds.has(item.id);
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.productItem}
                            onPress={() => toggleSelection(item.id)}
                        >
                            <View style={styles.productInfoContainer}>
                                {/* Product Image */}
                                <Image
                                    source={{ uri: item.imageUrl || item.image || 'https://via.placeholder.com/60' }}
                                    style={styles.productImage}
                                />

                                <View style={styles.textContainer}>
                                    <Text style={styles.productTitle} numberOfLines={2}>{item.title || item.name}</Text>
                                    <Text style={styles.variantText}>{item.variantCount || 1} Variants</Text>
                                </View>
                            </View>

                            {/* Checkbox */}
                            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                {isSelected && <IconSymbol name="checkmark" size={14} color="#FFFFFF" />}
                            </View>
                        </TouchableOpacity>
                    );
                })}

                {products.length === 0 && (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No products selected</Text>
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Save Selection</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1F2937', // Dark header as per screenshot
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    headerTitle: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    backButton: {
        padding: 4,
    },
    headerSpacer: {
        width: 32,
    },
    content: {
        flex: 1,
    },
    productItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    productInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    productImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
        marginRight: 8,
    },
    productTitle: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '500',
    },
    variantText: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#1F2937', // Dark border
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#1F2937', // Dark fill
        borderColor: '#1F2937',
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    saveButton: {
        backgroundColor: '#1F2937',
        borderRadius: 30, // Make it pill shaped like the other screens
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 6,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#6B7280',
        fontSize: 16,
    }
});

export default SelectedProductsPreviewScreen;
