import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Linking,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import HelpCenterScreen from './HelpCenterScreen';

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
}

interface Category {
  id: string;
  title: string;
  description: string;
  icon: string;
  articles: Article[];
}

const categories: Category[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Detailed Guides to help set-up your website',
    icon: 'clipboard-check',
    articles: [
      {
        id: 'a1',
        title: 'Account Set-Up',
        description: 'Learn how to create and set up your account',
        content: 'Step-by-step guide to setting up your Smartbiz account...',
        category: 'getting-started',
      },
      {
        id: 'a2',
        title: 'Store Name and Store Policy',
        description: 'Configure your store name and policies',
        content: 'How to set up your store name and create store policies...',
        category: 'getting-started',
      },
      {
        id: 'a3',
        title: 'First Product Setup',
        description: 'Add your first product to your store',
        content: 'Guide to adding products, images, and descriptions...',
        category: 'getting-started',
      },
    ],
  },
  {
    id: 'managing-website',
    title: 'Managing Your Website',
    description: 'Guides on how to enhance your website, manage orders and payments',
    icon: 'cellphone',
    articles: [
      {
        id: 'a4',
        title: 'Customize your Storefront',
        description: 'Customize your storefront appearance and layout',
        content:
          'We understand that every brand is special and unique. To help you convey your brand story and differentiate it from other stores, you can customize your storefront with themes, colors, and layouts...',
        category: 'managing-website',
      },
      {
        id: 'a5',
        title: 'Orders and Shipping',
        description: 'Manage orders and configure shipping settings',
        content: 'How to process orders, update status, and set up shipping...',
        category: 'managing-website',
      },
      {
        id: 'a6',
        title: 'Payments Configuration',
        description: 'Set up payment methods for your store',
        content: 'Configure Cash on Delivery and online payment options...',
        category: 'managing-website',
      },
    ],
  },
  {
    id: 'promoting-brand',
    title: 'Promoting Your Brand',
    description: 'Learn how to drive traffic & orders on your website',
    icon: 'rocket-launch',
    articles: [
      {
        id: 'a7',
        title: 'Create Marketing Campaigns',
        description: 'Set up marketing campaigns to send promotional messages',
        content:
          'On Smartbiz, you can set up marketing campaigns to send promotional messages to your customers via WhatsApp. You can use these campaigns to announce sales, new products, or special offers...',
        category: 'promoting-brand',
      },
      {
        id: 'a8',
        title: 'Offers and Discounts',
        description: 'Create and manage promotional offers',
        content: 'How to create discount codes and special offers...',
        category: 'promoting-brand',
      },
      {
        id: 'a9',
        title: 'Social Media Integration',
        description: 'Connect your social media accounts',
        content: 'Link Instagram, Facebook, and other social platforms...',
        category: 'promoting-brand',
      },
    ],
  },
  {
    id: 'new-features',
    title: 'Newly Launched Features',
    description: 'Guides on all newly launched features',
    icon: 'megaphone',
    articles: [
      {
        id: 'a10',
        title: 'WhatsApp Business Integration',
        description: 'Connect and use WhatsApp Business for customer communication',
        content: 'Learn how to integrate WhatsApp Business and send messages to customers...',
        category: 'new-features',
      },
      {
        id: 'a11',
        title: 'Analytics Dashboard',
        description: 'Track your store performance with analytics',
        content: 'Monitor sales, customer behavior, and store metrics...',
        category: 'new-features',
      },
    ],
  },
];

const featuredArticles: Article[] = [
  {
    id: 'f1',
    title: 'Customize your Storefront',
    description:
      'We understand that every brand is special and unique. To help you convey your brand story and differentiate it from other stores, you can customize your storefront...',
    content:
      'We understand that every brand is special and unique. To help you convey your brand story and differentiate it from other stores, you can customize your storefront with themes, colors, layouts, and more.',
    category: 'featured',
  },
  {
    id: 'f2',
    title: 'Create Marketing Campaigns',
    description:
      'On Smartbiz, you can set up marketing campaigns to send promotional messages to your customers via Whatsapp. You can use these campaigns...',
    content:
      'On Smartbiz, you can set up marketing campaigns to send promotional messages to your customers via WhatsApp. You can use these campaigns to announce sales, new products, or special offers.',
    category: 'featured',
  },
];

export default function HowToScreen({ onBack }: { onBack: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showFAQs, setShowFAQs] = useState(false);
  const [scrollToTop, setScrollToTop] = useState(false);

  const handleCategoryPress = (category: Category) => {
    setSelectedCategory(category);
    setSelectedArticle(null);
  };

  const handleArticlePress = (article: Article) => {
    setSelectedArticle(article);
  };

  const handlePopularSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleScrollToTop = () => {
    setScrollToTop(true);
    setTimeout(() => setScrollToTop(false), 100);
  };

  const handleGetInTouch = (type: string) => {
    if (type === 'support') {
      Alert.alert(
        'Need Help?',
        'Raise a support request from your SmartBiz mobile app. Open app, visit profile settings page. Click on help.'
      );
    } else if (type === 'instagram') {
      Linking.openURL('https://www.instagram.com').catch(() => {
        Alert.alert('Error', 'Unable to open Instagram');
      });
    } else if (type === 'youtube') {
      Linking.openURL('https://www.youtube.com').catch(() => {
        Alert.alert('Error', 'Unable to open YouTube');
      });
    }
  };

  // If article is selected, show article detail
  if (selectedArticle) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedArticle(null)}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.articleContent}>
          <Text style={styles.articleTitle}>{selectedArticle.title}</Text>
          <Text style={styles.articleDescription}>{selectedArticle.description}</Text>
          <View style={styles.articleDivider} />
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

  // If category is selected, show category articles
  if (selectedCategory) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedCategory(null)}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.banner}>
          <View style={styles.bannerLeft}>
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons name="store" size={32} color="#fff" />
            </View>
            <View style={styles.logoText}>
              <Text style={styles.logoMain}>smartbiz</Text>
              <Text style={styles.logoSub}>by amazon</Text>
            </View>
          </View>
          <Text style={styles.bannerText}>Help Center</Text>
          <TouchableOpacity>
            <MaterialCommunityIcons name="menu" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>{selectedCategory.title}</Text>
          <Text style={styles.sectionSubtitle}>{selectedCategory.description}</Text>

          {selectedCategory.articles.map((article) => (
            <TouchableOpacity
              key={article.id}
              style={styles.articleCard}
              onPress={() => handleArticlePress(article)}
            >
              <View style={styles.articleBullet} />
              <View style={styles.articleCardContent}>
                <Text style={styles.articleCardTitle}>{article.title}</Text>
                <Text style={styles.articleCardDescription}>{article.description}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#17aba5" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // Main screen
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.banner}>
        <View style={styles.bannerLeft}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="store" size={32} color="#fff" />
          </View>
          <View style={styles.logoText}>
            <Text style={styles.logoMain}>smartbiz</Text>
            <Text style={styles.logoSub}>by amazon</Text>
          </View>
        </View>
        <Text style={styles.bannerText}>Help Center</Text>
        <TouchableOpacity>
          <MaterialCommunityIcons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContentWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          ref={(ref) => {
            if (ref && scrollToTop) {
              ref.scrollTo({ y: 0, animated: true });
            }
          }}
        >
          {/* Search Section */}
          <Text style={styles.mainHeading}>How can we help?</Text>
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

        {/* Popular Searches */}
        <Text style={styles.popularSearchesLabel}>Popular searches:</Text>
        <View style={styles.popularSearches}>
          <TouchableOpacity
            style={styles.popularSearchButton}
            onPress={() => handlePopularSearch('setup')}
          >
            <Text style={styles.popularSearchText}>setup</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.popularSearchButton}
            onPress={() => handlePopularSearch('product listing')}
          >
            <Text style={styles.popularSearchText}>product listing</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.popularSearchButton}
            onPress={() => handlePopularSearch('customize design')}
          >
            <Text style={styles.popularSearchText}>customize design</Text>
          </TouchableOpacity>
        </View>

        {/* Category Cards */}
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            onPress={() => handleCategoryPress(category)}
          >
            <View style={styles.categoryIconContainer}>
              <MaterialCommunityIcons name={category.icon as any} size={48} color="#17aba5" />
            </View>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            <Text style={styles.categoryDescription}>{category.description}</Text>
          </TouchableOpacity>
        ))}

        {/* FAQs Card */}
        <TouchableOpacity style={styles.faqCard} onPress={() => setShowFAQs(true)}>
          <View style={styles.faqIconContainer}>
            <MaterialCommunityIcons name="help-circle" size={48} color="#222" />
          </View>
          <Text style={styles.faqCardTitle}>FAQs</Text>
        </TouchableOpacity>

        {/* Featured Articles Section */}
        <View style={styles.featuredSection}>
          <View style={styles.featuredHeader}>
            <MaterialCommunityIcons name="chart-line" size={20} color="#17aba5" />
            <Text style={styles.featuredTitle}>Featured articles</Text>
          </View>
          {featuredArticles.map((article) => (
            <TouchableOpacity
              key={article.id}
              style={styles.featuredArticle}
              onPress={() => handleArticlePress(article)}
            >
              <View style={styles.articleBullet} />
              <View style={styles.featuredArticleContent}>
                <Text style={styles.featuredArticleTitle}>{article.title}</Text>
                <Text style={styles.featuredArticleDescription} numberOfLines={2}>
                  {article.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Get in Touch Section */}
        <Text style={styles.getInTouchTitle}>Get in touch</Text>
        <TouchableOpacity
          style={styles.supportCard}
          onPress={() => handleGetInTouch('support')}
        >
          <View style={styles.supportIconContainer}>
            <MaterialCommunityIcons name="account-group" size={32} color="#FF9800" />
          </View>
          <View style={styles.supportCardContent}>
            <Text style={styles.supportCardTitle}>Need help?</Text>
            <Text style={styles.supportCardText}>
              Raise a support request from your SmartBiz mobile app. Open app, visit profile
              settings page. Click on help.
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.supportCard}
          onPress={() => handleGetInTouch('instagram')}
        >
          <View style={styles.supportIconContainer}>
            <MaterialCommunityIcons name="store" size={32} color="#17aba5" />
          </View>
          <View style={styles.supportCardContent}>
            <Text style={styles.supportCardTitle}>Get social with us</Text>
            <Text style={styles.supportCardText}>
              Follow us on Instagram for latest news & information
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.supportCard}
          onPress={() => handleGetInTouch('youtube')}
        >
          <View style={styles.supportIconContainer}>
            <MaterialCommunityIcons name="youtube" size={32} color="#FF0000" />
          </View>
          <View style={styles.supportCardContent}>
            <Text style={styles.supportCardTitle}>Subscribe our channel</Text>
            <Text style={styles.supportCardText}>
              Discover video tutorials to setup & manage your website
            </Text>
          </View>
        </TouchableOpacity>

          {/* Scroll to Top Button */}
          <TouchableOpacity style={styles.scrollToTopButton} onPress={handleScrollToTop}>
            <MaterialCommunityIcons name="arrow-up" size={20} color="#222" />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e4ec',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#17aba5',
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
  mainContentWrapper: {
    flex: 1,
    backgroundColor: '#1E3A8A',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  mainHeading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    marginLeft: 8,
  },
  popularSearchesLabel: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 12,
  },
  popularSearches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 32,
  },
  popularSearchButton: {
    backgroundColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  popularSearchText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryIconContainer: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#17aba5',
    marginBottom: 8,
    textAlign: 'center',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  faqCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  faqIconContainer: {
    marginBottom: 16,
  },
  faqCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  featuredSection: {
    marginBottom: 24,
  },
  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 8,
  },
  featuredArticle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingVertical: 12,
  },
  articleBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#17aba5',
    marginRight: 12,
    marginTop: 8,
  },
  featuredArticleContent: {
    flex: 1,
  },
  featuredArticleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#17aba5',
    marginBottom: 4,
  },
  featuredArticleDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  getInTouchTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
  },
  supportCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  supportIconContainer: {
    marginRight: 16,
  },
  supportCardContent: {
    flex: 1,
  },
  supportCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#17aba5',
    marginBottom: 8,
  },
  supportCardText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  scrollToTopButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  articleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  articleCardContent: {
    flex: 1,
    marginLeft: 12,
  },
  articleCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#17aba5',
    marginBottom: 4,
  },
  articleCardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  articleContent: {
    padding: 20,
  },
  articleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  articleDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  articleDivider: {
    height: 1,
    backgroundColor: '#e2e4ec',
    marginBottom: 20,
  },
  articleText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
});
