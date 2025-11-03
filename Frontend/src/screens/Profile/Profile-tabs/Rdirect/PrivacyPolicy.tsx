import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function PrivacyPolicyScreen({ onBack }: { onBack: () => void }) {
  const sectionTitles = [
    'What personal information do we collect?',
    'For what purposes does Smart Commerce use your personal information?',
    'What About Cookies and Other Identifiers?',
    'Does Smart Commerce share your personal information?',
    'How secure is information about me?',
    'What about advertising?',
    'What information can I access?',
    'Children\'s information',
    'What choices do I have?',
    'Related Practices and Information',
    'Information You Give Us When You Use Smart Commerce Services',
    'Automatic information',
    'Information from Other Sources',
    'Information you can access',
    'Grievance Officer/ Nodal Officer',
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerOverlay} />
          <MaterialCommunityIcons 
            name="lock" 
            size={64} 
            color="#87CEEB" 
            style={styles.lockIcon} 
          />
          <Text style={styles.bannerText}>Smart Commerce Privacy policy</Text>
        </View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons name="menu" size={24} color="#666" style={styles.menuIcon} />
          <View style={styles.logoBox}>
            <Text style={styles.logo}>
              smart<Text style={styles.logoTeal}>commerce</Text>
            </Text>
            <Text style={styles.logoSub}>by amazon</Text>
          </View>
        </View>

        {/* Section Links List */}
        <View style={styles.sectionsList}>
          <Text style={styles.listTitle}>What personal information do we collect?</Text>
          {sectionTitles.slice(1).map((title, index) => (
            <Text key={index} style={styles.sectionLinkText}>{title}</Text>
          ))}
        </View>

        {/* Introduction */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionText}>
            This Privacy Notice describes how Amazon Smart Commerce Solutions Private Limited ("Smart Commerce", "we", "us", or "our") collects and uses your personal information in connection with Smart Commerce Services.
          </Text>
          <Text style={styles.sectionText}>
            Smart Commerce enables you to (a) build an e-commerce website for your business, (b) track and manage all your inventory, orders and returns, wherever you sell – all in one place, and (c) fulfill all orders using Amazon's fulfillment network.
          </Text>
          <Text style={styles.sectionText}>
            Personal information subject to this Privacy Notice will be collected and processed by Smart Commerce, with a registered office at H-9, Block B-1, Mohan Cooperative Industrial Area, Mathura Road, New Delhi - 110044.
          </Text>
        </View>

        {/* Personal Information We Collect */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionHeading}>Personal Information We Collect</Text>
          <Text style={styles.sectionText}>
            We collect your personal information in order to provide and continually improve Smart Commerce Services.
          </Text>
          <Text style={styles.sectionText}>
            Here are the types of personal information we collect:
          </Text>

          <Text style={styles.subHeading}>Information You Give Us:</Text>
          <Text style={styles.sectionText}>
            We receive and store any information you provide in relation to Smart Commerce Services. Click here to see examples of what we collect. You can choose not to provide certain information, but then you might not be able to take advantage of many of our Smart Commerce Services.
          </Text>

          <Text style={styles.subHeading}>Automatic Information:</Text>
          <Text style={styles.sectionText}>
            We automatically collect and store certain types of information when you interact with Smart Commerce Services. Click here to see examples of what we collect.
          </Text>

          <Text style={styles.subHeading}>Information from Other Sources:</Text>
          <Text style={styles.sectionText}>
            We might receive information about you from other sources, such as updated delivery and address information from our carriers, which we use to correct our records and deliver your next purchase more easily.
          </Text>
        </View>

        {/* Information You Give Us Details */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionHeading}>Information You Give Us When You Use Smart Commerce Services</Text>
          <Text style={styles.sectionText}>
            Depending on your engagement with Smart Commerce Services, you might supply us with such information as:
          </Text>
          <Text style={styles.sectionText}>
            • Your name, email address, physical address, phone number, and other similar contact information; usernames, aliases, roles, and other authentication and security credential information;
          </Text>
          <Text style={styles.sectionText}>
            • Your subscription, purchase, usage, billing, and payment history;
          </Text>
          <Text style={styles.sectionText}>
            • Payment settings, such as payment instrument information and billing preferences; tax information; and email communication and notification settings.
          </Text>
        </View>

        {/* How We Use Personal Information */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionHeading}>How We Use Personal Information?</Text>
          <Text style={styles.sectionText}>
            We use your personal information to operate, provide, develop, and improve Smart Commerce Services. These purposes include:
          </Text>
          <Text style={styles.sectionText}>
            <Text style={styles.boldText}>1. Provide Smart Commerce Services:</Text> We use your personal information to provide Smart Commerce Services and process transactions with you, including registrations, subscriptions, purchases, payments, and returns.
          </Text>
          <Text style={styles.sectionText}>
            <Text style={styles.boldText}>2. Measure, support and improve Smart Commerce Services:</Text> We use your personal information to measure, support, and improve Smart Commerce Services, including measuring usage, analyzing performance, fixing errors, providing support, improving, and developing services.
          </Text>
          <Text style={styles.sectionText}>
            <Text style={styles.boldText}>3. Recommendations and personalization:</Text> We use your personal information to recommend Smart Commerce Services and other services provided by Smart Commerce and its affiliates that might be of interest to you, identify your preferences, and personalize your experience with Smart Commerce Services.
          </Text>
          <Text style={styles.sectionText}>
            <Text style={styles.boldText}>4. Comply with legal obligations:</Text> In certain cases, we have a legal obligation to collect, use, or retain, your personal information to comply with laws. For instance, we collect information regarding place of establishment and bank account information for identity verification and other purposes.
          </Text>
          <Text style={styles.sectionText}>
            <Text style={styles.boldText}>5. Communicate with you:</Text> We use your personal information to communicate with you in relation to Smart Commerce Services via different channels (e.g., by phone, e-mail, chat).
          </Text>
          <Text style={styles.sectionText}>
            <Text style={styles.boldText}>6. Marketing:</Text> We use your personal information to market and promote Smart Commerce Services, and other services provided by Smart Commerce and its affiliates to you.
          </Text>
          <Text style={styles.sectionText}>
            <Text style={styles.boldText}>7. Advertising:</Text> We use your personal information to display interest-based ads for features, products, and services that might be of interest to you. We do not use information that personally identifies you to display interest-based ads.
          </Text>
          <Text style={styles.sectionText}>
            <Text style={styles.boldText}>8. Fraud Prevention and Credit Risks:</Text> We use personal information to prevent and detect fraud and abuse in order to protect the security of our customers, Smart Commerce, and others. We may also use scoring methods to assess and manage credit risks.
          </Text>
          <Text style={styles.sectionText}>
            <Text style={styles.boldText}>9. Purposes for Which We Seek Your Consent:</Text> We may also ask for your consent to use your personal information for a specific purpose that we communicate to you.
          </Text>
        </View>

        {/* Cookies */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionHeading}>Cookies</Text>
          <Text style={styles.sectionText}>
            To enable our systems to recognize your browser or device and to provide, market and improve Smart Commerce Services, we use cookies and other identifiers. For more information about cookies and how we use them, please read our Cookies Notice.
          </Text>
        </View>

        {/* How We Share Personal Information */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionHeading}>How We Share Personal Information</Text>
          <Text style={styles.sectionText}>
            Information about our customers is an important part of our business and we are not in the business of selling our customers' personal information to others. We share customers' personal information only as described below and with Amazon.com, Inc. and subsidiaries that Amazon.com, Inc. controls that either are subject to this Privacy Notice or follow practices at least as protective as those described in this Privacy Notice.
          </Text>
          <Text style={styles.sectionText}>
            • <Text style={styles.boldText}>Transactions involving Third Parties:</Text> We make available to you services, software and content provided by third parties for use on or through Smart Commerce Services. For example, shipping and payment processing services offered by us are made available through third parties. You can tell when a third party is involved in your transactions, and we share customers' personal information related to those transactions with that third party.
          </Text>
        </View>

        {/* How We Secure Information */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionHeading}>How secure is information about me?</Text>
          <Text style={styles.sectionText}>
            We design our systems with your security and privacy in mind. We maintain physical, electronic, and procedural safeguards in connection with the collection, storage, and disclosure of customer personal information.
          </Text>
        </View>

        {/* Access and Choice */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionHeading}>What information can I access?</Text>
          <Text style={styles.sectionText}>
            You can access your information, including your name, address, payment options, profile information, and purchase history in the "Your Account" section of the website.
          </Text>
        </View>

        {/* Children's Information */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionHeading}>Children's information</Text>
          <Text style={styles.sectionText}>
            Smart Commerce Services are not intended for use by children. We do not knowingly collect personal information from children under the age of 18.
          </Text>
        </View>

        {/* Grievance Officer */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionHeading}>Grievance Officer / Nodal Officer</Text>
          <Text style={styles.sectionText}>
            Please find below the details of the grievance / Nodal officer:
          </Text>
          <Text style={styles.sectionText}>
            <Text style={styles.boldText}>Name:</Text> Aditi Urdhwareshe
          </Text>
          <Text style={styles.sectionText}>
            <Text style={styles.boldText}>Designation:</Text> Grievance officer/ Nodal Officer
          </Text>
          <Text style={styles.sectionText}>
            <Text style={styles.boldText}>Contact:</Text> smartcommerce-grievanceofficer@amazon.com
          </Text>
          <Text style={styles.sectionText}>
            The Grievance Officer is identified above pursuant to the provisions of applicable laws including but not limited to the Information Technology Act, 2000 and the Consumer Protection Act, 2019, and the Rules enacted under those laws.
          </Text>
        </View>

        {/* Disclaimer */}
        <View style={styles.contentSection}>
          <Text style={[styles.sectionHeading, styles.underlineText]}>Disclaimer:</Text>
          <Text style={styles.sectionText}>
            In the event of any discrepancy or conflict, the English version will prevail over the translation.
          </Text>
        </View>

        {/* Last Updated */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionText}>
            Last updated: 29/11/2023
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.socialIcons}>
            <TouchableOpacity style={styles.socialIcon}>
              <MaterialCommunityIcons name="instagram" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <MaterialCommunityIcons name="facebook" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <MaterialCommunityIcons name="youtube" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.logoContainerFooter}>
            <Text style={styles.logoText}>smartcommerce</Text>
            <Text style={styles.logoSubtext}>by amazon</Text>
          </View>
          <View style={styles.footerInfo}>
            <Text style={styles.footerText}>Built in</Text>
            <Text style={styles.flag}>🇮🇳</Text>
          </View>
          <Text style={styles.copyright}>
            © 2023 Amazon.com, Inc. or its affiliates. All rights reserved
          </Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Privacy policy</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Terms of use</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Sitemap</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  banner: {
    height: 180,
    backgroundColor: '#1a1a2e',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  lockIcon: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -32,
    opacity: 0.8,
  },
  bannerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    zIndex: 1,
    textAlign: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  menuIcon: {
    marginRight: 8,
  },
  logoBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  logoTeal: {
    color: '#17aba5',
  },
  logoSub: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  sectionsList: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  sectionLinkText: {
    fontSize: 16,
    color: '#222',
    paddingVertical: 6,
    paddingLeft: 6,
  },
  contentSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
    marginTop: 8,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 12,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    color: '#222',
    lineHeight: 24,
    marginBottom: 12,
  },
  boldText: {
    fontWeight: 'bold',
  },
  underlineText: {
    textDecorationLine: 'underline',
  },
  footer: {
    backgroundColor: '#1a1a2e',
    padding: 24,
    marginTop: 32,
    alignItems: 'center',
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 12,
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainerFooter: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  logoSubtext: {
    fontSize: 14,
    color: '#fff',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#fff',
    marginRight: 8,
  },
  flag: {
    fontSize: 20,
  },
  copyright: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 16,
  },
  footerLink: {
    fontSize: 14,
    color: '#fff',
    textDecorationLine: 'underline',
  },
});
