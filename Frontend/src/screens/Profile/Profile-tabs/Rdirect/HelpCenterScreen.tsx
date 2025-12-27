import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface FAQArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  hasStar?: boolean;
}

const faqArticles: FAQArticle[] = [
  {
    id: '1',
    title: 'Shipping and Order Management - FAQs',
    category: 'shipping',
    content: 'Find answers to common questions about shipping and order management...',
    hasStar: true,
  },
  {
    id: '2',
    title: 'Account Set-Up',
    category: 'account',
    content: 'Learn how to set up your account and get started...',
  },
  {
    id: '3',
    title: 'Customize your storefront',
    category: 'storefront',
    content: 'Customize your storefront appearance and layout...',
  },
  {
    id: '4',
    title: 'Store Name and Store Policy',
    category: 'store',
    content: 'Information about setting up your store name and policies...',
  },
  {
    id: '5',
    title: 'Orders and Shipping',
    category: 'orders',
    content: 'Everything you need to know about processing orders and shipping...',
  },
  {
    id: '6',
    title: 'Whatsapp Business',
    category: 'whatsapp',
    content: 'Connect and use WhatsApp Business for customer communication...',
  },
  {
    id: '7',
    title: 'Payments and Returns',
    category: 'payments',
    content: 'Configure payment methods and return policies...',
  },
  {
    id: '8',
    title: 'Sales Analytics',
    category: 'analytics',
    content: 'Track your sales and understand your analytics...',
  },
  {
    id: '9',
    title: 'Promotions',
    category: 'promotions',
    content: 'Create and manage promotions and discounts...',
  },
  {
    id: '10',
    title: 'Analytics',
    category: 'analytics',
    content: 'Monitor your store performance with analytics...',
  },
  {
    id: '11',
    title: 'Shipping Issues',
    category: 'shipping',
    content: 'Troubleshoot common shipping issues and problems...',
  },
];

export default function HelpCenterScreen({ onBack }: { onBack: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<FAQArticle | null>(null);

  const filteredArticles = faqArticles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleArticlePress = (article: FAQArticle) => {
    setSelectedArticle(article);
  };

  if (selectedArticle) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedArticle(null)}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.articleContent}>
          <Text style={styles.articleTitle}>{selectedArticle.title}</Text>
          <Text style={styles.articleText}>{selectedArticle.content}</Text>
          <Text style={styles.articleText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </Text>
          <Text style={styles.articleText}>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
            nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
            officia deserunt mollit anim id est laborum.
          </Text>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Help Center Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerLeft}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="store" size={32} color="#ffffff" />
          </View>
          <View style={styles.logoText}>
            <Text style={styles.logoMain}>Sakhi</Text>
            <Text style={styles.logoSub}>SmartBiz Sakhi store</Text>
          </View>
        </View>
        <Text style={styles.bannerText}>Help Center</Text>
        <TouchableOpacity>
          <MaterialCommunityIcons name="menu" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for answers"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Navigation Toggle */}
        <TouchableOpacity style={styles.navToggle}>
          <Text style={styles.navToggleText}>Toggle navigation menu</Text>
          <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        {/* Breadcrumbs */}
        <View style={styles.breadcrumbs}>
          <Text style={styles.breadcrumbText}>Sakhi</Text>
          <Text style={styles.breadcrumbSeparator}> / </Text>
          <Text style={styles.breadcrumbText}>FAQs</Text>
          <Text style={styles.breadcrumbSeparator}> / </Text>
          <Text style={styles.breadcrumbActive}>FAQs</Text>
        </View>

        {/* FAQs Section */}
        <View style={styles.faqsSection}>
          <Text style={styles.faqsHeading}>FAQs</Text>
          <Text style={styles.faqsSubtitle}>Refer our most frequently asked questions</Text>

          <View style={styles.articlesList}>
            {filteredArticles.map((article) => (
              <TouchableOpacity
                key={article.id}
                style={styles.articleItem}
                onPress={() => handleArticlePress(article)}
              >
                <View style={styles.articleBullet} />
                <Text style={styles.articleLink}>
                  {article.title}
                  {article.hasStar && (
                    <Text>
                      {' '}
                      <MaterialCommunityIcons name="star" size={14} color="#FF9800" />
                    </Text>
                  )}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerButton}>
            <MaterialCommunityIcons name="arrow-up" size={20} color="#e61580" />
          </TouchableOpacity>
          <View style={styles.footerLinks}>
            <TouchableOpacity>
              <Text style={styles.footerLinkText}>Homepage</Text>
            </TouchableOpacity>
            <Text style={styles.footerSeparator}>•</Text>
            <TouchableOpacity>
              <Text style={styles.footerLinkText}>Privacy policy</Text>
            </TouchableOpacity>
            <Text style={styles.footerSeparator}>•</Text>
            <TouchableOpacity>
              <Text style={styles.footerLinkText}>Terms of use</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.socialIcons}>
            <TouchableOpacity style={styles.socialIcon}>
              <MaterialCommunityIcons name="facebook" size={18} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <MaterialCommunityIcons name="instagram" size={18} color="#E4405F" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <MaterialCommunityIcons name="youtube" size={18} color="#FF0000" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff5f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    backgroundColor: '#e61580',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e4ec',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e61580',
    padding: 16,
    paddingHorizontal: 20,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    marginRight: 12,
  },
  logoText: {
    justifyContent: 'center',
  },
  logoMain: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoSub: {
    fontSize: 12,
    color: '#fff',
  },
  bannerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 16,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    marginLeft: 8,
  },
  navToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingHorizontal: 20,
  },
  navToggleText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  breadcrumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  breadcrumbText: {
    fontSize: 14,
    color: '#e61580',
  },
  breadcrumbSeparator: {
    fontSize: 14,
    color: '#e61580',
    marginHorizontal: 4,
  },
  breadcrumbActive: {
    fontSize: 14,
    color: '#e61580',
    fontWeight: '600',
  },
  faqsSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  faqsHeading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  faqsSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  articlesList: {
    marginTop: 8,
  },
  articleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  articleBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#222',
    marginRight: 12,
  },
  articleLink: {
    fontSize: 16,
    color: '#e61580',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e3f2fd',
    padding: 16,
    marginTop: 32,
    paddingHorizontal: 20,
  },
  footerButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#e61580',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },
  footerLinkText: {
    fontSize: 14,
    color: '#222',
  },
  footerSeparator: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 8,
  },
  socialIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  socialIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  articleContent: {
    padding: 20,
  },
  articleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
  },
  articleText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
});
