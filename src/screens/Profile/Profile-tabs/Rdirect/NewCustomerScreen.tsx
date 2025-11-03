import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface NewCustomerScreenProps {
  onBack: () => void;
}

export default function NewCustomerScreen({ onBack }: NewCustomerScreenProps) {
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [nameError, setNameError] = useState('');
  const [mobileError, setMobileError] = useState('');

  const validateName = (value: string) => {
    if (!value.trim()) {
      setNameError('Name is required');
      return false;
    }
    setNameError('');
    return true;
  };

  const validateMobile = (value: string) => {
    const cleanNumber = value.replace(/[^0-9]/g, '');
    if (!cleanNumber) {
      setMobileError('Mobile number is required');
      return false;
    }
    if (cleanNumber.length !== 10) {
      setMobileError('Mobile number must be 10 digits');
      return false;
    }
    setMobileError('');
    return true;
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (nameError) {
      validateName(value);
    }
  };

  const handleMobileChange = (value: string) => {
    // Only allow digits
    const numericValue = value.replace(/[^0-9]/g, '');
    setMobileNumber(numericValue);
    if (mobileError) {
      validateMobile(numericValue);
    }
  };

  const handleAdd = () => {
    const isNameValid = validateName(name);
    const isMobileValid = validateMobile(mobileNumber);

    if (!isNameValid || !isMobileValid) {
      return;
    }

    Alert.alert('Success', 'Customer added successfully!', [{ text: 'OK', onPress: onBack }]);
  };

  const isFormValid = name.trim().length > 0 && mobileNumber.replace(/[^0-9]/g, '').length === 10;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="close" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Add new customer</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Name *</Text>
          <TextInput
            style={[styles.input, nameError && styles.inputError]}
            placeholder="Enter customer name"
            value={name}
            onChangeText={handleNameChange}
            onBlur={() => validateName(name)}
            autoCapitalize="words"
          />
          {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Mobile Number *</Text>
          <TextInput
            style={[styles.input, mobileError && styles.inputError]}
            placeholder="Enter mobile number"
            value={mobileNumber}
            onChangeText={handleMobileChange}
            onBlur={() => validateMobile(mobileNumber)}
            keyboardType="phone-pad"
            maxLength={10}
          />
          {mobileError ? <Text style={styles.errorText}>{mobileError}</Text> : null}
        </View>

        <TouchableOpacity
          style={[styles.addButton, !isFormValid && styles.addButtonDisabled]}
          onPress={handleAdd}
          disabled={!isFormValid}
        >
          <Text style={[styles.addButtonText, !isFormValid && styles.addButtonTextDisabled]}>
            Add
          </Text>
        </TouchableOpacity>
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
  title: {
    fontWeight: 'bold',
    fontSize: 22,
    color: '#222',
  },
  content: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#363740',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#363740',
    borderWidth: 1,
    borderColor: '#e2e4ec',
  },
  inputError: {
    borderColor: '#d73a33',
    borderWidth: 2,
  },
  errorText: {
    fontSize: 14,
    color: '#d73a33',
    marginTop: 6,
  },
  addButton: {
    backgroundColor: '#17aba5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButtonDisabled: {
    backgroundColor: '#e3f2fd',
    elevation: 0,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  addButtonTextDisabled: {
    color: '#666',
  },
});

