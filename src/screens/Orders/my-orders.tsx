import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SectionList,
} from "react-native";

import AcceptedOrders from "./accepted-orders";
import CanceledOrders from "./canceled-orders";
import DeliveredOrders from "./delivered-orders";
import PendingOrders from "./pending-orders";
import PickupReadyOrders from "./pickup-ready-orders";
import RejectedOrders from "./rejected-orders";
import ShippedOrders from "./shipped-orders";

const MyOrders = () => {
  const [selectedTab, setSelectedTab] = useState("All");

  const tabs = [
    "All",
    "Pending",
    "Accepted",
    "Shipped",
    "Pickup ready",
    "Delivered/Picked",
    "Canceled",
    "Rejected",
  ];

  const renderAllOrders = () => {
    // Using SectionList fixes the nested VirtualizedList issue
    const config = [
      { title: "Pending Orders", component: <PendingOrders /> },
      { title: "Accepted Orders", component: <AcceptedOrders /> },
      { title: "Shipped Orders", component: <ShippedOrders /> },
      { title: "Pickup Ready Orders", component: <PickupReadyOrders /> },
      { title: "Delivered Orders", component: <DeliveredOrders /> },
      { title: "Canceled Orders", component: <CanceledOrders /> },
      { title: "Rejected Orders", component: <RejectedOrders /> },
    ];

    // Each section must have a `data` array; we use a single placeholder item
    const sections = config.map((s) => ({ ...s, data: [s.title] }));

    return (
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item)}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        )}
        renderItem={({ section }) => (
          <View style={styles.sectionContent}>{section.component}</View>
        )}
        contentContainerStyle={styles.sectionListContainer}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const renderSelectedTab = () => {
    switch (selectedTab) {
      case "Pending":
        return <PendingOrders />;
      case "Accepted":
        return <AcceptedOrders />;
      case "Shipped":
        return <ShippedOrders />;
      case "Rejected":
        return <RejectedOrders />;
      case "Canceled":
        return <CanceledOrders />;
      case "Delivered/Picked":
        return <DeliveredOrders />;
      case "Pickup ready":
        return <PickupReadyOrders />;
      case "All":
        return renderAllOrders();
      default:
        return (
          <View style={styles.centerContent}>
            <TouchableOpacity style={styles.refreshButton}>
              <Text>🔄</Text>
            </TouchableOpacity>
            <Text style={styles.noOrdersText}>
              {`No ${selectedTab.toLowerCase()} orders yet`}
            </Text>
            <Text style={styles.subText}>
              Share your website link with customers to get more{" "}
              {selectedTab.toLowerCase()} orders
            </Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>My Orders</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabScrollContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, selectedTab === tab && styles.activeTab]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>{renderSelectedTab()}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#e61580",
  },
  headerText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  tabScrollContainer: {
    borderBottomWidth: 1,
    borderColor: "#dee2e6",
    backgroundColor: "#FFFFFF",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 8,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#e61580",
  },
  tabText: {
    color: "#6c757d",
    fontSize: 14,
    textAlign: "center",
  },
  activeTabText: {
    color: "#e61580",
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
  },
  sectionListContainer: {
    paddingBottom: 60,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 10,
    color: "#333333",
  },
  sectionContent: {
    marginBottom: 15,
  },
  centerContent: {
    alignItems: "center",
    marginTop: 40,
  },
  refreshButton: {
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 50,
    marginBottom: 15,
  },
  noOrdersText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  subText: {
    color: "#6c757d",
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 30,
  },
});

export default MyOrders;
