import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import IconSymbol from '../../components/IconSymbol';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const FAQsScreen: React.FC = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <IconSymbol name="chevron-back" size={28} color="#000000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Frequently Asked Questions</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>

                <AccordionItem
                    question="What implies hyperlocal delivery?"
                    answer="Hyperlocal delivery refers to delivering goods within a small, specific geographical area, typically within a few kilometers of the seller's location. This often allows for very fast delivery times, such as 30-60 minutes."
                />

                <AccordionItem
                    question="How do I calculate standard delivery time?"
                    answer="Standard delivery time is estimated based on the distance between the pickup and drop-off locations, the shipping carrier's speed, and any processing time needed. For most intra-city deliveries, 2-4 hours is standard, while inter-city can take 3-5 days."
                />

                <AccordionItem
                    question="How do I set delivery charges?"
                    answer="You can set delivery charges in the 'Store Configuration' > 'Delivery Settings' section. You can choose to have Free Delivery, Flat Rate, or distance-based charges."
                />

                <AccordionItem
                    question="Can I restrict delivery to specific areas?"
                    answer="Yes, you can set a maximum delivery radius in 'Delivery Settings' or restrict to specific pin codes to ensure you only receive orders you can fulfill."
                />

                <AccordionItem
                    question="How do I get paid for my sales?"
                    answer="Payments are processed securely and deposited directly into your linked bank account. You can track your earnings and payout status in the 'Payments' section."
                />

                <AccordionItem
                    question="How do I add products to my catalog?"
                    answer="Go to the 'Catalog' tab and tap 'Add Product'. You can upload images, add descriptions, set prices, and manage inventory for each item."
                />

                <AccordionItem
                    question="Can I customize my store link?"
                    answer="Yes, your store link is generated based on your store name. You can share this link on WhatsApp, Instagram, and other social media platforms to drive traffic to your store."
                />

                <AccordionItem
                    question="What if a customer wants to return a product?"
                    answer="You can manage returns and refunds through the 'Orders' tab. You can set your own return policy in the 'Store Configuration' settings."
                />

            </ScrollView>
        </View>
    );
};

const AccordionItem = ({ question, answer }: { question: string, answer: string }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    return (
        <View style={styles.accordionItem}>
            <TouchableOpacity
                style={styles.accordionHeader}
                onPress={toggleExpand}
                activeOpacity={0.7}
            >
                <Text style={styles.accordionTitle}>{question}</Text>
                <IconSymbol
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#666666"
                />
            </TouchableOpacity>
            {expanded && (
                <View style={styles.accordionContent}>
                    <Text style={styles.accordionText}>{answer}</Text>
                </View>
            )}
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
    scrollView: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        padding: 20,
    },
    accordionItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        paddingVertical: 16,
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    accordionTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000000',
        flex: 1,
        paddingRight: 10,
    },
    accordionContent: {
        marginTop: 12,
        paddingRight: 10,
    },
    accordionText: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 22,
    },
});

export default FAQsScreen;
