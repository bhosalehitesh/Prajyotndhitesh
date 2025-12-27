import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    TextInput,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import IconSymbol from '../../components/IconSymbol';
import { storage } from '../../authentication/storage';

const DeliveryTimeScreen: React.FC = () => {
    const navigation = useNavigation();

    // State
    const [pincode, setPincode] = useState<string>('411048'); // Default fallback
    const [localDeliveryTime, setLocalDeliveryTime] = useState('2-6 Hours');
    const [nationalDeliveryTime, setNationalDeliveryTime] = useState('3-5 Days');

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);

    // Which setting are we editing? 'local' | 'national' | null
    const [editingType, setEditingType] = useState<'local' | 'national' | null>(null);

    const [minTime, setMinTime] = useState('');
    const [maxTime, setMaxTime] = useState('');
    const [timeUnit, setTimeUnit] = useState<'Hours' | 'Days' | 'Minutes'>('Hours');

    // Load data
    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Get Pincode from onboarding data
                const onboardingDataStr = await storage.getItem('onboardingData');
                if (onboardingDataStr) {
                    const data = JSON.parse(onboardingDataStr);
                    if (data.location && data.location.pincode) {
                        setPincode(data.location.pincode);
                    }
                }

                // 2. Get saved delivery times if any
                const savedLocal = await storage.getItem('localDeliveryTime');
                if (savedLocal) setLocalDeliveryTime(savedLocal);

                const savedNational = await storage.getItem('nationalDeliveryTime');
                if (savedNational) setNationalDeliveryTime(savedNational);

            } catch (error) {
                console.error('Error loading delivery settings:', error);
            }
        };
        loadData();
    }, []);

    // Helper to extract numbers and unit from saved string like "2-6 Hours" or "Delivered in 2-6 Hours"
    const parseTimeHeader = (timeStr: string) => {
        // Remove "Delivered in " prefix if present
        const cleanStr = timeStr.replace('Delivered in ', '');

        // Use regex to match something like "2-6 Hours" or "3 Days"
        // Match: (min)(-max)? (Unit)
        const match = cleanStr.match(/^(\d+)(?:-(\d+))?\s+(\w+)$/);

        if (match) {
            return {
                min: match[1],
                max: match[2] || '', // max might be undefined
                unit: match[3] as 'Hours' | 'Days' | 'Minutes'
            };
        }

        // Fallback defaults
        return { min: '', max: '', unit: 'Hours' as const };
    };

    const openModal = (type: 'local' | 'national') => {
        setEditingType(type);

        if (type === 'local') {
            const { min, max, unit } = parseTimeHeader(localDeliveryTime);
            // If parse fails (e.g. empty), default to 2-6 Hours
            setMinTime(min || '2');
            setMaxTime(max || '6');
            setTimeUnit(unit && ['Hours', 'Days', 'Minutes'].includes(unit) ? unit : 'Hours');
        } else {
            const { min, max, unit } = parseTimeHeader(nationalDeliveryTime);
            // If parse fails, default to 3-5 Days
            setMinTime(min || '3');
            setMaxTime(max || '5');
            setTimeUnit(unit && ['Hours', 'Days', 'Minutes'].includes(unit) ? unit : 'Days');
        }

        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!minTime) {
            Alert.alert('Error', 'Please enter a minimum time');
            return;
        }

        const maxPart = maxTime ? `-${maxTime}` : '';
        const newTime = `${minTime}${maxPart} ${timeUnit}`;
        const displayString = `Delivered in ${newTime}`; // "Delivered in 2-6 Hours"

        if (editingType === 'local') {
            setLocalDeliveryTime(displayString);
            await storage.setItem('localDeliveryTime', displayString);
        } else if (editingType === 'national') {
            setNationalDeliveryTime(displayString);
            await storage.setItem('nationalDeliveryTime', displayString);
        }

        setModalVisible(false);
    };

    const toggleUnit = () => {
        if (timeUnit === 'Hours') setTimeUnit('Days');
        else if (timeUnit === 'Days') setTimeUnit('Minutes');
        else setTimeUnit('Hours');
    };

    const getModalTitle = () => {
        if (editingType === 'local') {
            return `Delivery time within ${pincode}`;
        }
        return 'Delivery time across India';
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <IconSymbol name="chevron-back" size={28} color="#000000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Delivery Time</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>

                {/* Section 1 */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Standard delivery time for orders</Text>

                    {/* Local Delivery Row */}
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => openModal('local')}
                    >
                        <Text style={styles.rowLabel}>Within {pincode}</Text>
                        <View style={styles.rowRight}>
                            <Text style={styles.rowValue}>{localDeliveryTime.replace('Delivered in ', '')}</Text>
                            <IconSymbol name="chevron-forward" size={20} color="#25A0B0" />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    {/* National Delivery Row */}
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => openModal('national')}
                    >
                        <Text style={styles.rowLabel}>Across India</Text>
                        <View style={styles.rowRight}>
                            <Text style={styles.rowValue}>{nationalDeliveryTime.replace('Delivered in ', '')}</Text>
                            <IconSymbol name="chevron-forward" size={20} color="#25A0B0" />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.divider} />
                </View>

                {/* Section 2: Recommendation */}
                <View style={styles.recommendationSection}>
                    <View style={styles.recommendationHeaderRow}>
                        <IconSymbol name="bulb-outline" size={20} color="#C5A000" />
                        <Text style={styles.recommendationHeader}>Our Recommendation for average delivery times</Text>
                    </View>

                    <View style={styles.bulletPoint}>
                        <Text style={styles.bulletText}>• Hyperlocal deliveries: 30-60 minutes</Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bulletText}>• Within the city: 2-4 hours</Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bulletText}>• Across India: 3-5 days</Text>
                    </View>
                </View>

            </ScrollView>

            {/* Modal */}
            < Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalContainer}
                >
                    <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                        <View style={styles.modalOverlay} />
                    </TouchableWithoutFeedback>

                    <View style={styles.modalContent}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>{getModalTitle()}</Text>

                        {/* Minimum Input */}
                        <Text style={styles.inputLabel}>Minimum</Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.input}
                                value={minTime}
                                onChangeText={setMinTime}
                                keyboardType="numeric"
                                placeholder={editingType === 'national' ? "3" : "2"}
                            />
                            <TouchableOpacity style={styles.unitSelector} onPress={toggleUnit}>
                                <Text style={styles.unitText}>{timeUnit}</Text>
                                <IconSymbol name="chevron-down" size={16} color="#000" />
                            </TouchableOpacity>
                        </View>

                        {/* Maximum Input */}
                        <Text style={styles.inputLabel}>Maximum (Optional)</Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.input}
                                value={maxTime}
                                onChangeText={setMaxTime}
                                keyboardType="numeric"
                                placeholder={editingType === 'national' ? "5" : "6"}
                            />
                            <TouchableOpacity style={styles.unitSelector} onPress={toggleUnit}>
                                <Text style={styles.unitText}>{timeUnit}</Text>
                                <IconSymbol name="chevron-down" size={16} color="#000" />
                            </TouchableOpacity>
                        </View>

                        {/* Preview */}
                        <Text style={styles.previewLabel}>This is what your customer sees</Text>
                        <View style={styles.previewBox}>
                            <View style={styles.previewIcon}>
                                <IconSymbol name="car-outline" size={24} color="#666" />
                            </View>
                            <Text style={styles.previewText}>
                                Delivered in {minTime}{maxTime ? `-${maxTime}` : ''} {timeUnit}
                            </Text>
                        </View>

                        {/* Buttons */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal >

        </View >
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
        backgroundColor: '#FFFFFF',
        paddingTop: 16,
        paddingBottom: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'center',
        marginRight: 32,
    },
    headerSpacer: {
        width: 24,
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        padding: 20,
    },
    section: {
        marginTop: 10,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
    },
    rowLabel: {
        fontSize: 16,
        color: '#000000',
        fontWeight: '400',
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowValue: {
        fontSize: 16,
        color: '#25A0B0',
        fontWeight: '600',
        marginRight: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        width: '100%',
    },
    recommendationSection: {
        marginTop: 30,
    },
    recommendationHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    recommendationHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666666',
        marginLeft: 8,
    },
    bulletPoint: {
        marginTop: 4,
        marginLeft: 4,
    },
    bulletText: {
        fontSize: 14,
        color: '#888888',
        lineHeight: 22,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        color: '#333333',
        marginBottom: 8,
        marginTop: 10,
    },
    inputRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 4,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: '#000000',
        marginRight: 10,
    },
    unitSelector: {
        width: 100,
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        backgroundColor: '#F5F5F5',
    },
    unitText: {
        fontSize: 16,
        color: '#000000',
    },
    previewLabel: {
        fontSize: 14,
        color: '#888888',
        marginTop: 20,
        marginBottom: 10,
    },
    previewBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        borderRadius: 8,
        padding: 16,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        marginBottom: 24,
    },
    previewIcon: {
        marginRight: 12,
    },
    previewText: {
        fontSize: 16,
        color: '#000000',
    },
    buttonContainer: {
        gap: 12,
    },
    saveButton: {
        backgroundColor: '#CFE8F3', // Light blue/teal from screenshot
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#888888', // Disabled looking color or active? Screenshot has it greyed out
    },
    saveButtonActive: {
        backgroundColor: '#00838F',
    },
    closeButton: {
        backgroundColor: '#006677', // Dark teal
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export default DeliveryTimeScreen;
