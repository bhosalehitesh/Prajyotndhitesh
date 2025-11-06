import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import LegalScreen from './Profile-tabs/LegalScreen';
import StoreConfigScreen from './Profile-tabs/StoreConfigScreen';
import ShippingScreen from './Profile-tabs/ShippingScreen';
import PaymentsScreen from './Profile-tabs/PaymentsScreen';
import GrowthEngagementScreen from './Profile-tabs/GrowthEngagementScreen';
import TrustMarkersScreen from './Profile-tabs/TrustMarkersScreen';
import NeedHelpScreen from './Profile-tabs/NeedHelpScreen';
import {
  EditProfileScreen,
  CashOnDeliveryScreen,
  OnlinePaymentScreen,
  OffersDiscountsScreen,
  MarketingAutomationScreen,
  InstagramFeedScreen,
  SellUsingWhatsAppScreen,
  HelpCenterScreen,
  HowToScreen,
  TalkToUsScreen,
  ChatScreen,
  TrustBadgesScreen,
  DeliverySettingsScreen,
  ReturnsScreen,
  StoreAppearanceScreen,
  CustomDomainScreen,
  GoogleAnalyticsScreen,
  StoreTimingsScreen,
  StorePoliciesScreen,
  TermsScreen,
  PrivacyPolicyScreen,
} from './Profile-tabs/Rdirect';

const menuList = [
  { label: 'Store Configuration', subtitle: 'Appearance, Domain, Timings & more' },
  { label: 'Shipping', subtitle: 'Delivery Settings & Returns' },
  { label: 'Payments', subtitle: 'Cash on Delivery & Online Payments' },
  { label: 'Growth & Engagement', subtitle: 'Coupons, Campaigns, SEO' },
  { label: 'Trust Markers', subtitle: 'Trust Badges & Social Media Links' },
  { label: 'Need Help?', subtitle: 'FAQs, How Tos, Contact Us' },
  { label: 'Legal', subtitle: 'Terms of Use, Privacy Policy' },
];

type SubPage = null | 'store' | 'shipping' | 'payments' | 'growth' | 'trust' | 'help' | 'legal' | 'edit' 
  | 'editProfile' | 'cod' | 'onlinePayment' | 'offers' | 'marketing' | 'instagram' | 'whatsapp'
  | 'helpCenter' | 'howTo' | 'talkToUs' | 'chat' | 'trustBadges' | 'deliverySettings' | 'returns'
  | 'storeAppearance' | 'customDomain' | 'analytics' | 'timings' | 'policies' | 'terms' | 'privacy';

const ProfileScreen = () => {
  const [acceptOrders, setAcceptOrders] = useState(true);
  const [pickup, setPickup] = useState(true);
  const [delivery, setDelivery] = useState(true);
  const [subPage, setSubPage] = useState<SubPage>(null);

  // --- SUB SCREEN CONDITIONAL RENDER ---
  if (subPage === 'legal') return <LegalScreen onBack={() => setSubPage(null)} />;
  if (subPage === 'store') return <StoreConfigScreen onBack={() => setSubPage(null)} />;
  if (subPage === 'shipping') return <ShippingScreen onBack={() => setSubPage(null)} />;
  if (subPage === 'payments') return <PaymentsScreen onBack={() => setSubPage(null)} />;
  if (subPage === 'growth') return <GrowthEngagementScreen onBack={() => setSubPage(null)} />;
  if (subPage === 'trust') return <TrustMarkersScreen onBack={() => setSubPage(null)} />;
  if (subPage === 'help') return <NeedHelpScreen onBack={() => setSubPage(null)} />;
  if (subPage === 'edit' || subPage === 'editProfile') return <EditProfileScreen onBack={() => setSubPage(null)} />;
  
  // Rdirect screens
  if (subPage === 'cod') return <CashOnDeliveryScreen onBack={() => setSubPage(null)} />;
  if (subPage === 'onlinePayment') return <OnlinePaymentScreen onBack={() => setSubPage(null)} />;
  if (subPage === 'offers') return <OffersDiscountsScreen onBack={() => setSubPage(null)} />;
  if (subPage === 'marketing') return <MarketingAutomationScreen onBack={() => setSubPage(null)} />;
  if (subPage === 'instagram') return <InstagramFeedScreen onBack={() => setSubPage(null)} />;
  if (subPage === 'whatsapp') return <SellUsingWhatsAppScreen onBack={() => setSubPage(null)} />;
  if (subPage === 'helpCenter') return <HelpCenterScreen onBack={() => setSubPage(null)} />;
  if (subPage === 'howTo') return <HowToScreen onBack={() => setSubPage(null)} />;
  if (subPage === 'talkToUs') return <TalkToUsScreen onBack={() => setSubPage(null)} />;
  if (subPage === 'chat') return <ChatScreen onBack={() => setSubPage(null)} />;
  if (subPage === 'trustBadges') return <TrustBadgesScreen onBack={() => setSubPage(null)} />;
  if (subPage === 'deliverySettings') return <DeliverySettingsScreen onBack={() => setSubPage(null)} />;
  if (subPage === 'returns') return <ReturnsScreen onBack={() => setSubPage(null)} />;
  if (subPage === 'storeAppearance') return <StoreAppearanceScreen onBack={() => setSubPage(null)} />;
  if (subPage === 'customDomain') return <CustomDomainScreen onBack={() => setSubPage(null)} />;
  if (subPage === 'analytics') return <GoogleAnalyticsScreen onBack={() => setSubPage(null)} />;
  if (subPage === 'timings') return <StoreTimingsScreen onBack={() => setSubPage(null)} />;
  if (subPage === 'policies') return <StorePoliciesScreen onBack={() => setSubPage(null)} />;
  if (subPage === 'terms') return <TermsScreen onBack={() => setSubPage(null)} />;
  if (subPage === 'privacy') return <PrivacyPolicyScreen onBack={() => setSubPage(null)} />;

  // --- MAIN PROFILE SCREEN ---
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{paddingBottom:36}}>
        {/* Top Card */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => setSubPage('edit')}
          activeOpacity={0.7}
        >
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}><Text style={styles.avatarText}>G</Text></View>
          </View>
          <View style={{flex:1, marginLeft:16}}>
            <Text style={styles.name}>Girnai</Text>
            <Text style={styles.phone}>+91 8766408154</Text>
        </View>
          <MaterialCommunityIcons name="chevron-right" size={28} color="#e61580" />
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuList.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={() => {
                switch(item.label) {
                  case 'Legal':
                    setSubPage('legal');
                    break;
                  case 'Need Help?':
                    setSubPage('help');
                    break;
                  case 'Trust Markers':
                    setSubPage('trust');
                    break;
                  case 'Store Configuration':
                    setSubPage('store');
                    break;
                  case 'Shipping':
                    setSubPage('shipping');
                    break;
                  case 'Payments':
                    setSubPage('payments');
                    break;
                  case 'Growth & Engagement':
                    setSubPage('growth');
                    break;
                  default:
                    // no-op
                }
              }}
            >
              <View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#e61580" />
            </TouchableOpacity>
          ))}
          </View>
          
        {/* Toggles */}
        <View style={styles.togglesSection}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleText}>Accept Orders</Text>
            <Switch value={acceptOrders} onValueChange={setAcceptOrders} trackColor={{ false: '#d1d5db', true: '#e61580' }} thumbColor={acceptOrders ? '#ffffff' : '#f4f3f4'} />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleText}>Pickup</Text>
            <Switch value={pickup} onValueChange={setPickup} trackColor={{ false: '#d1d5db', true: '#e61580' }} thumbColor={pickup ? '#ffffff' : '#f4f3f4'} />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleText}>Delivery</Text>
            <Switch value={delivery} onValueChange={setDelivery} trackColor={{ false: '#d1d5db', true: '#e61580' }} thumbColor={delivery ? '#ffffff' : '#f4f3f4'} />
          </View>
        </View>

        {/* Developer Section - All Screens */}
        <View style={styles.devSection}>
          <Text style={styles.devSectionTitle}>Developer: All Screens</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.devScroll}>
            <TouchableOpacity style={styles.devButton} onPress={() => setSubPage('editProfile')}>
              <Text style={styles.devButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.devButton} onPress={() => setSubPage('cod')}>
              <Text style={styles.devButtonText}>COD</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.devButton} onPress={() => setSubPage('onlinePayment')}>
              <Text style={styles.devButtonText}>Online Payment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.devButton} onPress={() => setSubPage('offers')}>
              <Text style={styles.devButtonText}>Offers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.devButton} onPress={() => setSubPage('marketing')}>
              <Text style={styles.devButtonText}>Marketing</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.devButton} onPress={() => setSubPage('instagram')}>
              <Text style={styles.devButtonText}>Instagram</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.devButton} onPress={() => setSubPage('whatsapp')}>
              <Text style={styles.devButtonText}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.devButton} onPress={() => setSubPage('helpCenter')}>
              <Text style={styles.devButtonText}>Help Center</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.devButton} onPress={() => setSubPage('howTo')}>
              <Text style={styles.devButtonText}>How To</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.devButton} onPress={() => setSubPage('talkToUs')}>
              <Text style={styles.devButtonText}>Talk To Us</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.devButton} onPress={() => setSubPage('chat')}>
              <Text style={styles.devButtonText}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.devButton} onPress={() => setSubPage('trustBadges')}>
              <Text style={styles.devButtonText}>Trust Badges</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.devButton} onPress={() => setSubPage('deliverySettings')}>
              <Text style={styles.devButtonText}>Delivery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.devButton} onPress={() => setSubPage('returns')}>
              <Text style={styles.devButtonText}>Returns</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.devButton} onPress={() => setSubPage('storeAppearance')}>
              <Text style={styles.devButtonText}>Appearance</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.devButton} onPress={() => setSubPage('customDomain')}>
              <Text style={styles.devButtonText}>Domain</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.devButton} onPress={() => setSubPage('analytics')}>
              <Text style={styles.devButtonText}>Analytics</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.devButton} onPress={() => setSubPage('timings')}>
              <Text style={styles.devButtonText}>Timings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.devButton} onPress={() => setSubPage('policies')}>
              <Text style={styles.devButtonText}>Policies</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.devButton} onPress={() => setSubPage('terms')}>
              <Text style={styles.devButtonText}>Terms</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.devButton} onPress={() => setSubPage('privacy')}>
              <Text style={styles.devButtonText}>Privacy</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* App Actions */}
        <TouchableOpacity style={styles.shareBtn}>
          <MaterialCommunityIcons name="share-variant" size={20} color="#1E3A8A" />
          <Text style={styles.shareText}>Share Store</Text>
          </TouchableOpacity>
        <TouchableOpacity style={styles.logoutBtn}>
          <MaterialCommunityIcons name="logout" size={20} color="#d73a33" />
          <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#e61580' }, // Bright pink background
  profileCard: {
    backgroundColor:'#fff',
    flexDirection:'row',
    alignItems:'center',
    margin:16,
    marginBottom:10,
    borderRadius:16,
    paddingHorizontal:18,
    paddingVertical:15,
    elevation:2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarWrap: { marginRight:0 },
  avatar: {
    width:64, height:64, borderRadius:32, backgroundColor:'#e61580', // Pink avatar background
    alignItems:'center', justifyContent:'center',
  },
  avatarText: { fontWeight:'bold', fontSize:28, color:'#ffffff' }, // White text on pink
  name: { fontWeight:'bold', fontSize:22, color:'#1a1a1a' },
  phone: { color:'#6B7280', fontWeight:'500', marginTop:2, fontSize:15 },
  menuSection: { backgroundColor:'#fff', borderRadius:14, marginHorizontal:16, marginBottom:18, overflow: 'hidden', elevation:1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  menuItem: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:16, borderBottomWidth:1, borderColor:'#F3F4F6' },
  menuLabel: { fontWeight:'bold', fontSize:17, color:'#1a1a1a' },
  menuSubtitle: { fontSize:14, color:'#6B7280', marginTop:3 },
  togglesSection: { backgroundColor:'#fff', marginHorizontal:16, borderRadius:13, marginBottom:18, padding:16, elevation:1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  toggleRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:6 },
  toggleText: { fontSize:16, color:'#1a1a1a', fontWeight:'400' },
  devSection: { backgroundColor:'#fff', marginHorizontal:16, borderRadius:13, marginBottom:18, padding:16, elevation:1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  devSectionTitle: { fontSize:16, fontWeight:'bold', color:'#e61580', marginBottom:12 }, // Pink title
  devScroll: { marginHorizontal: -16 },
  devButton: { backgroundColor:'#fff5f9', paddingHorizontal:16, paddingVertical:8, borderRadius:20, marginRight:8, borderWidth:1, borderColor:'#e61580' }, // Light pink background with pink border
  devButtonText: { fontSize:12, color:'#e61580', fontWeight:'500' }, // Pink text
  appSection: {alignItems:'flex-start', paddingHorizontal:18, marginTop:8, marginBottom:12},
  appName: {fontWeight:'bold', color:'#6B7280', fontSize:16, marginBottom:2},
  appInfo: {color:'#6B7280', fontSize:14 },
  shareBtn: {
    flexDirection:'row', justifyContent:'center', alignItems:'center',
    backgroundColor:'#fff', borderRadius:12, marginHorizontal:22, paddingVertical:14, marginTop:5,
    borderWidth:1, borderColor:'#e61580', elevation:1, shadowColor: '#e61580', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3
  },
  shareText: { color:'#e61580', fontSize:17, fontWeight:'bold', marginLeft:8 },
  logoutBtn: {
    flexDirection:'row', justifyContent:'center', alignItems:'center',
    backgroundColor:'#fff', borderRadius:12, marginHorizontal:22, paddingVertical:14, marginTop:11,
    borderWidth:1, borderColor:'#d1d5db', elevation:1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2
  },
  logoutText: { color:'#d73a33', fontSize:17, fontWeight:'bold', marginLeft:8 },
});

export default ProfileScreen;
