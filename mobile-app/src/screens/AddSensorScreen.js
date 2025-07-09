import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { addSensor } from '../api';

export default function AddSensorScreen({ navigation }) {
  const [local, setLocal] = useState('');
  const [id, setId] = useState('');
  const [tempDesejada, setTempDesejada] = useState('22');
  const [tempAtual, setTempAtual] = useState('20');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!local || !id) {
      Alert.alert('Error', 'Please fill in all required fields (Location and ID)');
      return;
    }

    // Validate ID is a number
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      Alert.alert('Error', 'ID must be a number');
      return;
    }

    // Validate temperatures are numbers
    const desiredTemp = parseInt(tempDesejada);
    const currentTemp = parseInt(tempAtual);
    if (isNaN(desiredTemp) || isNaN(currentTemp)) {
      Alert.alert('Error', 'Temperatures must be numbers');
      return;
    }

    setLoading(true);
    try {
      await addSensor({ 
        id: numericId,
        local,
        tempDesejada: desiredTemp,
        tempAtual: currentTemp
      });
      Alert.alert('Success', 'Sensor added successfully');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to add sensor: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Sensor</Text>
      
      <Text style={styles.label}>Sensor ID *</Text>
      <TextInput
        style={styles.input}
        value={id}
        onChangeText={setId}
        placeholder="Enter sensor ID (number)"
        keyboardType="numeric"
        maxLength={10}
      />

      <Text style={styles.label}>Location *</Text>
      <TextInput
        style={styles.input}
        value={local}
        onChangeText={setLocal}
        placeholder="Enter location (e.g., Living Room, Kitchen)"
        maxLength={100}
      />

      <Text style={styles.label}>Desired Temperature (°C)</Text>
      <TextInput
        style={styles.input}
        value={tempDesejada}
        onChangeText={setTempDesejada}
        placeholder="22"
        keyboardType="numeric"
        maxLength={3}
      />

      <Text style={styles.label}>Current Temperature (°C)</Text>
      <TextInput
        style={styles.input}
        value={tempAtual}
        onChangeText={setTempAtual}
        placeholder="20"
        keyboardType="numeric"
        maxLength={3}
      />

      <View style={styles.buttonContainer}>
        <Button 
          title={loading ? 'Adding...' : 'Add Sensor'} 
          onPress={handleSubmit} 
          disabled={loading}
          color="#2196F3"
        />
      </View>

      <Text style={styles.note}>
        * Required fields{'\n'}
        Temperatures will default to 22°C (desired) and 20°C (current) if left empty
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 24, 
    backgroundColor: '#fff' 
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333'
  },
  label: { 
    fontSize: 16, 
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#333'
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9'
  },
  buttonContainer: {
    marginTop: 30,
    marginBottom: 20
  },
  note: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20
  }
}); 