import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { addSensor } from '../api';

export default function AddSensorScreen({ navigation }) {
  const [local, setLocal] = useState('');
  const [id, setId] = useState('');
  const [tempDesejada, setTempDesejada] = useState('22');
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

    // Validate temperature is a number
    const desiredTemp = parseInt(tempDesejada);
    if (isNaN(desiredTemp)) {
      Alert.alert('Error', 'Desired temperature must be a number');
      return;
    }

    setLoading(true);
    try {
      await addSensor({ 
        id: numericId,
        local,
        tempDesejada: desiredTemp
      });
      Alert.alert('Success', 'Sensor added successfully');
      navigation.goBack({ params: { newSensorId: numericId } });
    } catch (e) {
      Alert.alert('Error', 'Failed to add sensor: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
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
        Current temperature will be set by the sensor hardware{'\n'}
        Desired temperature defaults to 22°C if left empty
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