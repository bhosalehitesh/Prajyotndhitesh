import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function StoreTimingsScreen({ onBack }: { onBack: () => void }) {
  const [openHour, setOpenHour] = useState('10');
  const [openMinute, setOpenMinute] = useState('00');
  const [openPeriod, setOpenPeriod] = useState('AM');
  const [closeHour, setCloseHour] = useState('10');
  const [closeMinute, setCloseMinute] = useState('00');
  const [closePeriod, setClosePeriod] = useState('PM');
  const [selectedDays, setSelectedDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#edeff3' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Store Timings</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.timingCard}>
            {/* Opens at */}
            <Text style={styles.sectionLabel}>Opens at:</Text>
            <View style={styles.timePickerRow}>
              <View style={styles.timeInput}>
                <Text style={styles.timeValue}>{openHour}:{openMinute}</Text>
                <View style={styles.timeControls}>
                  <TouchableOpacity style={styles.timeButton}>
                    <MaterialCommunityIcons name="chevron-up" size={16} color="#363740" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.timeButton}>
                    <MaterialCommunityIcons name="chevron-down" size={16} color="#363740" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.periodInput}>
                <Text style={styles.timeValue}>{openPeriod}</Text>
                <View style={styles.timeControls}>
                  <TouchableOpacity style={styles.timeButton}>
                    <MaterialCommunityIcons name="chevron-up" size={16} color="#363740" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.timeButton}>
                    <MaterialCommunityIcons name="chevron-down" size={16} color="#363740" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Closes at */}
            <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Closes at:</Text>
            <View style={styles.timePickerRow}>
              <View style={styles.timeInput}>
                <Text style={styles.timeValue}>{closeHour}:{closeMinute}</Text>
                <View style={styles.timeControls}>
                  <TouchableOpacity style={styles.timeButton}>
                    <MaterialCommunityIcons name="chevron-up" size={16} color="#363740" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.timeButton}>
                    <MaterialCommunityIcons name="chevron-down" size={16} color="#363740" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.periodInput}>
                <Text style={styles.timeValue}>{closePeriod}</Text>
                <View style={styles.timeControls}>
                  <TouchableOpacity style={styles.timeButton}>
                    <MaterialCommunityIcons name="chevron-up" size={16} color="#363740" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.timeButton}>
                    <MaterialCommunityIcons name="chevron-down" size={16} color="#363740" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Store open on */}
            <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Store open on :</Text>
            <Text style={styles.hintText}>Tap to select working days</Text>
            <View style={styles.daysContainer}>
              {days.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    selectedDays.includes(day) && styles.dayButtonActive,
                  ]}
                  onPress={() => toggleDay(day)}
                >
                  <Text
                    style={[
                      styles.dayButtonText,
                      selectedDays.includes(day) && styles.dayButtonTextActive,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.saveButtonContainer}>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#f5f5fa',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 28,
    textAlign: 'center',
    marginLeft: 12,
    flex: 1,
    color: '#222',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  timingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 100,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  timePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e4ec',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  periodInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e4ec',
    borderRadius: 8,
    padding: 12,
    marginLeft: 8,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#363740',
  },
  timeControls: {
    flexDirection: 'column',
  },
  timeButton: {
    padding: 2,
  },
  hintText: {
    fontSize: 14,
    color: '#858997',
    marginBottom: 12,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  dayButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e2e4ec',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  dayButtonActive: {
    backgroundColor: '#17aba5',
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#858997',
  },
  dayButtonTextActive: {
    color: '#fff',
  },
  saveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e4ec',
  },
  saveButton: {
    backgroundColor: '#17aba5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

