/**
 * Analytics Screen
 * 
 * Main analytics dashboard displaying Orders, Sales, Returns, and Customer Details.
 * 
 * BACKEND INTEGRATION:
 * - Data fetching is handled by useAnalyticsData hook
 * - Update filters state to trigger new API calls
 * - All data models are defined in ./types.ts
 */

import React, {useState, useMemo} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import IconSymbol from '../../components/IconSymbol';
import {
  AnalyticsTab,
  DateRangePreset,
  OrderStatus,
  DateRange,
  AnalyticsFilters,
} from './types';
import {useAnalyticsData} from './useAnalyticsData';

interface AnalyticsScreenProps {
  navigation: any;
}

const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({navigation}) => {
  // ==================== UI STATE ====================
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('Orders');
  
  // Initialize dates based on "Today"
  const getInitialDates = () => {
    const today = new Date();
    const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };
    return {from: formatDate(today), to: formatDate(today)};
  };

  // Initialize date range
  const initialDates = getInitialDates();
  const [fromDate, setFromDate] = useState(initialDates.from);
  const [toDate, setToDate] = useState(initialDates.to);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangePreset>('Today');
  
  // Order status filter (only for Orders tab)
  const [selectedOrderStatuses, setSelectedOrderStatuses] = useState<OrderStatus[]>([]);
  const [orderStatusDisplayText, setOrderStatusDisplayText] = useState<string>('');
  
  // Modal states
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [customDateModalOpen, setCustomDateModalOpen] = useState(false);
  
  // Date picker states
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedFromDate, setSelectedFromDate] = useState<Date | null>(null);
  const [selectedToDate, setSelectedToDate] = useState<Date | null>(null);
  const [dateSelectionMode, setDateSelectionMode] = useState<'from' | 'to'>('from');
  
  // Status modal temporary state
  const [tempSelectedStatuses, setTempSelectedStatuses] = useState<Record<string, boolean>>({});
  
  // ==================== DATA FETCHING ====================
  
  /**
   * Build filters object for API request
   * This object is passed to useAnalyticsData hook
   */
  const filters: AnalyticsFilters = useMemo(
    () => ({
      dateRange: {from: fromDate, to: toDate},
      orderStatus: selectedOrderStatuses.length > 0 ? selectedOrderStatuses : undefined,
      tab: activeTab,
    }),
    [fromDate, toDate, selectedOrderStatuses, activeTab],
  );

  /**
   * Fetch analytics data using custom hook
   * Backend team: Data fetching is handled in useAnalyticsData.ts
   */
  const {data: analyticsData, loading, error, refetch} = useAnalyticsData(filters);
  const [currentTime] = useState(new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }));

  const getDateRange = (range: string) => {
    const today = new Date();
    const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    switch (range) {
      case 'Today':
        return {from: formatDate(today), to: formatDate(today)};
      case 'Yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return {from: formatDate(yesterday), to: formatDate(yesterday)};
      case 'This Week':
        const weekStart = new Date(today);
        // Calculate Monday of current week (Monday = 1, Sunday = 0)
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday (0) to 6 days back
        weekStart.setDate(today.getDate() - daysFromMonday);
        return {from: formatDate(weekStart), to: formatDate(today)};
      case 'Last Week':
        const lastWeekStart = new Date(today);
        const lastDayOfWeek = today.getDay();
        const lastDaysFromMonday = lastDayOfWeek === 0 ? 6 : lastDayOfWeek - 1;
        lastWeekStart.setDate(today.getDate() - lastDaysFromMonday - 7); // Go back 7 days from this week's Monday
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekStart.getDate() + 6); // End on Sunday
        return {from: formatDate(lastWeekStart), to: formatDate(lastWeekEnd)};
      case 'This Month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return {from: formatDate(monthStart), to: formatDate(today)};
      case 'This Year':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        return {from: formatDate(yearStart), to: formatDate(today)};
      default:
        return {from: fromDate, to: toDate};
    }
  };

  /**
   * Handle date range preset selection
   */
  const handleDateRangeSelect = (range: DateRangePreset) => {
    setSelectedDateRange(range);
    if (range !== 'Custom') {
      const dates = getDateRange(range);
      setFromDate(dates.from);
      setToDate(dates.to);
      setDateModalOpen(false);
      // Trigger data refetch when date range changes
      refetch();
    } else {
      // Open custom date picker
      setDateModalOpen(false);
      setCustomDateModalOpen(true);
      // Parse current dates
      const parseDate = (dateStr: string) => {
        const [day, month, year] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
      };
      setSelectedFromDate(parseDate(fromDate));
      setSelectedToDate(parseDate(toDate));
      setCurrentMonth(parseDate(fromDate));
      setDateSelectionMode('from');
    }
  };

  const formatDateForDisplay = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDateForState = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleCustomDateSelect = (date: Date) => {
    if (dateSelectionMode === 'from') {
      setSelectedFromDate(date);
      // If "To" date is before "From" date, clear it
      if (selectedToDate && date > selectedToDate) {
        setSelectedToDate(null);
      }
      setDateSelectionMode('to');
    } else {
      // If selected date is before "From" date, set it as "From" instead
      if (selectedFromDate && date < selectedFromDate) {
        setSelectedFromDate(date);
        setSelectedToDate(selectedFromDate);
      } else {
        setSelectedToDate(date);
      }
    }
  };

  /**
   * Apply custom date range selection
   */
  const handleApplyCustomDates = () => {
    if (selectedFromDate && selectedToDate) {
      setFromDate(formatDateForState(selectedFromDate));
      setToDate(formatDateForState(selectedToDate));
      setSelectedDateRange('Custom');
      setCustomDateModalOpen(false);
      // Trigger data refetch when date range changes
      refetch();
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{day: number; isCurrentMonth: boolean; date: Date}> = [];

    // Previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({day: prevMonthLastDay - i, isCurrentMonth: false, date});
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({day, isCurrentMonth: true, date});
    }

    // Next month's days to fill the grid
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({day, isCurrentMonth: false, date});
    }

    return days;
  };

  const isDateInRange = (date: Date) => {
    if (!selectedFromDate || !selectedToDate) return false;
    return date >= selectedFromDate && date <= selectedToDate;
  };

  const isDateSelected = (date: Date) => {
    if (dateSelectionMode === 'from') {
      return selectedFromDate?.toDateString() === date.toDateString();
    } else {
      return selectedToDate?.toDateString() === date.toDateString();
    }
  };

  const statusOptions = [
    'Accepted',
    'Delivered',
    'Pending',
    'Rejected',
    'Shipped',
    'Pickup Ready',
    'Cancelled',
  ];

  const handleStatusToggle = (status: string) => {
    setTempSelectedStatuses(prev => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  /**
   * Open status filter modal with current selections
   */
  const handleOpenStatusModal = () => {
    const currentSelections: Record<string, boolean> = {};
    selectedOrderStatuses.forEach(status => {
      currentSelections[status] = true;
    });
    setTempSelectedStatuses(currentSelections);
    setStatusModalOpen(true);
  };

  /**
   * Apply order status filters
   */
  const handleApplyFilters = () => {
    const selected: OrderStatus[] = Object.entries(tempSelectedStatuses)
      .filter(([_, isSelected]) => isSelected)
      .map(([status, _]) => status as OrderStatus);
    
    setSelectedOrderStatuses(selected);
    
    // Update display text
    if (selected.length > 0) {
      setOrderStatusDisplayText(`${selected.length} selected`);
    } else {
      setOrderStatusDisplayText('');
    }
    
    setStatusModalOpen(false);
    // Trigger data refetch when filters change
    refetch();
  };

  /**
   * Clear order status filters
   */
  const handleClearFilters = () => {
    setTempSelectedStatuses({});
    setSelectedOrderStatuses([]);
    setOrderStatusDisplayText('');
    refetch();
  };
  
  /**
   * Handle tab change - triggers data refetch
   */
  const handleTabChange = (tab: AnalyticsTab) => {
    setActiveTab(tab);
    // Data will be refetched automatically via useAnalyticsData hook
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerTime}>Data of {currentTime}</Text>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.tabsContainer, {minHeight: 48}]}
        style={styles.tabsScrollView}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Orders' && styles.tabActive]}
          onPress={() => handleTabChange('Orders')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'Orders' && styles.tabTextActive,
            ]}>
            Orders
          </Text>
        </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.tab, activeTab === 'Sales' && styles.tabActive]}
                    onPress={() => handleTabChange('Sales')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'Sales' && styles.tabTextActive,
            ]}>
            Sales
          </Text>
        </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.tab, activeTab === 'Returns' && styles.tabActive]}
                    onPress={() => handleTabChange('Returns')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'Returns' && styles.tabTextActive,
            ]}>
            Returns
          </Text>
        </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.tab, activeTab === 'Customer Details' && styles.tabActive]}
                    onPress={() => handleTabChange('Customer Details')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'Customer Details' && styles.tabTextActive,
            ]}>
            Customer Details
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Date Range Selector */}
      <View style={styles.dateContainer}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setDateModalOpen(true)}>
          <Text style={styles.dateButtonText}>From {fromDate}</Text>
        </TouchableOpacity>
        <Text style={styles.dateSeparator}>-</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setDateModalOpen(true)}>
          <Text style={styles.dateButtonText}>To {toDate}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.calendarButton}
          onPress={() => setDateModalOpen(true)}>
          <IconSymbol name="calendar" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Order Status Filter - Only show for Orders tab */}
      {activeTab === 'Orders' && (
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={styles.statusDropdown}
            onPress={handleOpenStatusModal}>
            <Text style={[styles.statusText, !orderStatusDisplayText && styles.placeholderText]}>
              {orderStatusDisplayText || 'Order Status'}
            </Text>
            <IconSymbol name="chevron-down" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {activeTab === 'Orders' && (
          <>
            {/* Insights Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Insights</Text>
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No results</Text>
                <Text style={styles.emptyStateText}>
                  There was not enough data to perform this calculation.
                </Text>
              </View>
            </View>

            {/* Daily Orders Trendline Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Daily Orders Trendline</Text>
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No data</Text>
                <Text style={styles.emptyStateText}>
                  There was no data found for the visual.
                </Text>
              </View>
            </View>

            {/* Order Status Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Status</Text>
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No data</Text>
                <Text style={styles.emptyStateText}>
                  There was no data found for the visual.
                </Text>
              </View>
            </View>

            {/* Cannot Access Data Section */}
            <View style={styles.section}>
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>Cannot access data for this visual</Text>
              </View>
            </View>
          </>
        )}

        {activeTab === 'Sales' && (
          <>
            {/* Daily Sales Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Daily Sales (INR)</Text>
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No data</Text>
                <Text style={styles.emptyStateText}>
                  There was no data found for the visual.
                </Text>
              </View>
            </View>

            {/* Bestsellers Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bestsellers</Text>
              <View style={styles.emptyState}>
                <Text style={styles.bestsellersText}>Top products as per total sales is:</Text>
              </View>
            </View>

            {/* Sales by Category Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sales by Category</Text>
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No data</Text>
                <Text style={styles.emptyStateText}>
                  There was no data found for the visual.
                </Text>
              </View>
            </View>
          </>
        )}

        {activeTab === 'Returns' && (
          <>
            {/* Insights Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Insights</Text>
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No data</Text>
                <Text style={styles.emptyStateText}>
                  There was no data found for the visual.
                </Text>
              </View>
            </View>

            {/* Return Request by Payment Mode Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Return Request by Payment Mode</Text>
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No data</Text>
                <Text style={styles.emptyStateText}>
                  There was no data found for the visual.
                </Text>
              </View>
            </View>

            {/* Return Requests Reason Code Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Return Requests Reason Code</Text>
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No data</Text>
                <Text style={styles.emptyStateText}>
                  There was no data found for the visual.
                </Text>
              </View>
            </View>

            {/* All Returns Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>All Returns</Text>
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No data</Text>
                <Text style={styles.emptyStateText}>
                  There was no data found for the visual.
                </Text>
              </View>
            </View>
          </>
        )}

        {activeTab === 'Customer Details' && (
          <>
            {/* Insights Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Insights</Text>
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No results</Text>
                <Text style={styles.emptyStateText}>
                  There was not enough data to perform this calculation.
                </Text>
              </View>
            </View>

            {/* Customers by purchase pattern Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Customers by purchase pattern</Text>
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No data</Text>
                <Text style={styles.emptyStateText}>
                  There was no data found for the visual.
                </Text>
              </View>
            </View>

            {/* Customer Details Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Customer Details</Text>
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No data</Text>
                <Text style={styles.emptyStateText}>
                  There was no data found for the visual.
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Order Status Modal */}
      <Modal
        transparent
        visible={statusModalOpen}
        animationType="slide"
        onRequestClose={() => setStatusModalOpen(false)}>
        <Pressable
          style={styles.backdrop}
          onPress={() => setStatusModalOpen(false)}>
          <Pressable style={styles.statusModal} onPress={e => e.stopPropagation()}>
            {/* Drag Handle */}
            <View style={styles.dragHandle} />
            
            <View style={styles.statusModalHeader}>
              <Text style={styles.statusModalTitle}>Order Status</Text>
              <TouchableOpacity onPress={() => setStatusModalOpen(false)}>
                <IconSymbol name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.statusOptionsList}>
              {statusOptions.map(status => (
                <TouchableOpacity
                  key={status}
                  style={styles.statusOption}
                  onPress={() => handleStatusToggle(status)}>
                  <View
                    style={[
                      styles.checkbox,
                      tempSelectedStatuses[status] && styles.checkboxChecked,
                    ]}>
                    {tempSelectedStatuses[status] && (
                      <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.statusOptionText}>{status}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearFilters}>
                <Text style={styles.clearButtonText}>Clear Filters</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApplyFilters}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Date Range Picker Modal */}
      <Modal
        transparent
        visible={dateModalOpen}
        animationType="slide"
        onRequestClose={() => setDateModalOpen(false)}>
        <Pressable
          style={styles.backdrop}
          onPress={() => setDateModalOpen(false)}>
          <Pressable style={styles.dateModal} onPress={e => e.stopPropagation()}>
            {/* Drag Handle */}
            <View style={styles.dragHandle} />

            <ScrollView>
              {(['Today', 'Yesterday', 'This Week', 'Last Week', 'This Month', 'This Year', 'Custom'] as DateRangePreset[]).map(
                (range: DateRangePreset) => (
                  <TouchableOpacity
                    key={range}
                    style={[
                      styles.dateRangeOption,
                      selectedDateRange === range && styles.dateRangeOptionActive,
                    ]}
                    onPress={() => handleDateRangeSelect(range)}>
                    <Text
                      style={[
                        styles.dateRangeOptionText,
                        selectedDateRange === range && styles.dateRangeOptionTextActive,
                      ]}>
                      {range}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Custom Date Range Picker Modal */}
      <Modal
        transparent
        visible={customDateModalOpen}
        animationType="slide"
        onRequestClose={() => setCustomDateModalOpen(false)}>
        <Pressable
          style={styles.backdrop}
          onPress={() => setCustomDateModalOpen(false)}>
          <Pressable style={styles.customDateModal} onPress={e => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.customDateHeader}>
              <Text style={styles.customDateTitle}>Select Date Range</Text>
              <TouchableOpacity onPress={() => setCustomDateModalOpen(false)}>
                <IconSymbol name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {/* From/To Date Inputs */}
            <View style={styles.dateInputsRow}>
              <TouchableOpacity
                style={[
                  styles.dateInput,
                  dateSelectionMode === 'from' && styles.dateInputActive,
                ]}
                onPress={() => {
                  setDateSelectionMode('from');
                  if (selectedFromDate) {
                    setCurrentMonth(selectedFromDate);
                  }
                }}>
                <Text style={styles.dateInputLabel}>From</Text>
                <Text style={styles.dateInputValue}>
                  {selectedFromDate
                    ? formatDateForDisplay(selectedFromDate)
                    : 'Select date'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.dateInput,
                  dateSelectionMode === 'to' && styles.dateInputActive,
                ]}
                onPress={() => {
                  setDateSelectionMode('to');
                  if (selectedToDate) {
                    setCurrentMonth(selectedToDate);
                  } else if (selectedFromDate) {
                    setCurrentMonth(selectedFromDate);
                  }
                }}>
                <Text style={styles.dateInputLabel}>To</Text>
                <Text style={styles.dateInputValue}>
                  {selectedToDate
                    ? formatDateForDisplay(selectedToDate)
                    : 'Select date'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Calendar Header */}
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                style={styles.monthNavButton}
                onPress={() => navigateMonth('prev')}>
                <IconSymbol name="chevron-back" size={20} color="#0F172A" />
              </TouchableOpacity>
              <Text style={styles.monthYearText}>
                {currentMonth.toLocaleString('default', {
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
              <TouchableOpacity
                style={styles.monthNavButton}
                onPress={() => navigateMonth('next')}>
                <IconSymbol name="chevron-forward" size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {/* Week Day Headers */}
            <View style={styles.weekDaysHeader}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <Text key={day} style={styles.weekDayText}>
                  {day}
                </Text>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {getCalendarDays().map((item, index) => {
                const isSelected = isDateSelected(item.date);
                const inRange = isDateInRange(item.date);
                const isToday =
                  item.date.toDateString() === new Date().toDateString();

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.calendarDay,
                      !item.isCurrentMonth && styles.calendarDayOtherMonth,
                      isSelected && styles.calendarDaySelected,
                      inRange && !isSelected && styles.calendarDayInRange,
                      isToday && styles.calendarDayToday,
                    ]}
                    onPress={() => handleCustomDateSelect(item.date)}>
                    <Text
                      style={[
                        styles.calendarDayText,
                        !item.isCurrentMonth && styles.calendarDayTextOtherMonth,
                        isSelected && styles.calendarDayTextSelected,
                        isToday && !isSelected && styles.calendarDayTextToday,
                      ]}>
                      {item.day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Apply Button */}
            <TouchableOpacity
              style={[
                styles.applyCustomButton,
                (!selectedFromDate || !selectedToDate) &&
                  styles.applyCustomButtonDisabled,
              ]}
              onPress={handleApplyCustomDates}
              disabled={!selectedFromDate || !selectedToDate}>
              <Text
                style={[
                  styles.applyCustomButtonText,
                  (!selectedFromDate || !selectedToDate) &&
                    styles.applyCustomButtonTextDisabled,
                ]}>
                Apply Changes
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  headerTime: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  tabsScrollView: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    maxHeight: 48,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#e61580',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#e61580',
    fontWeight: '600',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateButtonText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  dateSeparator: {
    fontSize: 16,
    color: '#64748B',
    marginHorizontal: 4,
  },
  calendarButton: {
    width: 44,
    height: 44,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  statusDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  placeholderText: {
    color: '#94A3B8',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    minHeight: 200,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  bestsellersText: {
    fontSize: 14,
    color: '#0F172A',
    textAlign: 'left',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  statusModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 8,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  statusModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  statusModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  statusOptionsList: {
    maxHeight: 400,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#94A3B8',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#e61580',
    borderColor: '#e61580',
  },
  statusOptionText: {
    fontSize: 16,
    color: '#0F172A',
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#e61580',
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#e61580',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dateModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingTop: 8,
  },
  dateRangeOption: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dateRangeOptionActive: {
    backgroundColor: '#EEF2FF',
  },
  dateRangeOptionText: {
    fontSize: 16,
    color: '#0F172A',
  },
  dateRangeOptionTextActive: {
    color: '#e61580',
    fontWeight: '600',
  },
  customDateModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 20,
    padding: 20,
    maxHeight: '90%',
  },
  customDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  customDateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  dateInputsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  dateInputActive: {
    borderColor: '#e61580',
    borderWidth: 2,
  },
  dateInputLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  dateInputValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthNavButton: {
    padding: 8,
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  weekDaysHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  calendarDayOtherMonth: {
    opacity: 0.3,
  },
  calendarDaySelected: {
    backgroundColor: '#e61580',
  },
  calendarDayInRange: {
    backgroundColor: '#EEF2FF',
  },
  calendarDayToday: {
    borderWidth: 1,
    borderColor: '#e61580',
  },
  calendarDayText: {
    fontSize: 14,
    color: '#0F172A',
  },
  calendarDayTextOtherMonth: {
    color: '#94A3B8',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  calendarDayTextToday: {
    color: '#e61580',
    fontWeight: '600',
  },
  applyCustomButton: {
    backgroundColor: '#e61580',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyCustomButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  applyCustomButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  applyCustomButtonTextDisabled: {
    color: '#94A3B8',
  },
});

export default AnalyticsScreen;
