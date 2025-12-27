import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import IconSymbol from '../../components/IconSymbol';

const ContactUsScreen: React.FC = () => {
    const navigation = useNavigation();

    const [issue, setIssue] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [preferredLanguage, setPreferredLanguage] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const languages = ['English', 'Hindi', 'Marathi', 'Gujarati', 'Tamil'];

    const handleSubmit = async () => {
        if (!issue.trim()) {
            Alert.alert('Required', 'Please describe your issue.');
            return;
        }
        if (!contactNumber.trim() || contactNumber.length < 10) {
            Alert.alert('Required', 'Please enter a valid 10-digit contact number.');
            return;
        }
        if (!preferredLanguage) {
            Alert.alert('Required', 'Please select a preferred language.');
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            Alert.alert(
                'Request Submitted',
                'We have received your request. Our support team will call you shortly.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        }, 1500);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <IconSymbol name="chevron-back" size={28} color="#000000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Contact Us</Text>
                <View style={styles.headerSpacer} />
            </View>

            <View style={styles.contentContainer}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.formSection}>
                        <Text style={styles.description}>
                            Need help? Submit your details and our support team will contact you to resolve your issue.
                        </Text>

                        {/* Issue Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Describe your issue</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Tell us what you're facing trouble with..."
                                value={issue}
                                onChangeText={setIssue}
                                multiline={true}
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Contact Number Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Contact Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter 10-digit mobile number"
                                value={contactNumber}
                                onChangeText={(text) => setContactNumber(text.replace(/[^0-9]/g, ''))}
                                keyboardType="number-pad"
                                maxLength={10}
                            />
                        </View>

                        {/* Language Selection */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Preferred Language</Text>
                            <View style={styles.languageGrid}>
                                {languages.map((lang) => (
                                    <TouchableOpacity
                                        key={lang}
                                        style={[
                                            styles.languageChip,
                                            preferredLanguage === lang && styles.languageChipSelected
                                        ]}
                                        onPress={() => setPreferredLanguage(lang)}
                                    >
                                        <Text style={[
                                            styles.languageText,
                                            preferredLanguage === lang && styles.languageTextSelected
                                        ]}>
                                            {lang}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* Submit Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.submitButtonText}>Request Call Back</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
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
    contentContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingBottom: 100, // Extra space for footer
    },
    formSection: {
        gap: 24,
    },
    description: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
        marginBottom: 8,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#000000',
        backgroundColor: '#FAFAFA',
    },
    textArea: {
        minHeight: 120,
    },
    languageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    languageChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    languageChipSelected: {
        backgroundColor: '#E61580', // Using the app's primary pink color
        borderColor: '#E61580',
    },
    languageText: {
        fontSize: 14,
        color: '#333333',
        fontWeight: '500',
    },
    languageTextSelected: {
        color: '#FFFFFF',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        backgroundColor: '#FFFFFF',
    },
    submitButton: {
        backgroundColor: '#E61580',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ContactUsScreen;
