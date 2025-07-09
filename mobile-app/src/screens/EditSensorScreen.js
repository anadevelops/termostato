import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { getThermostat, updateSensor, deleteSensor } from '../api';

export default function EditSensorScreen({ navigation, route }) {
  const { sensorId } = route.params;
  const [local, setLocal] = useState('');
  const [id, setId] = useState('');
  const [tempDesejada, setTempDesejada] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load sensor data on mount
  useEffect(() => {
    loadSensorData();
  }, []);

  const loadSensorData = async () => {
    try {
      const sensor = await getThermostat(sensorId);
      setLocal(sensor.nome || '');
      setId(sensor.id?.toString() || '');
      setTempDesejada(sensor.tempDesejada?.toString() || '');
    } catch (e) {
      Alert.alert('Error', 'Failed to load sensor data: ' + e.message);
      navigation.goBack();
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!local) {
      Alert.alert('Error', 'Please fill in the Location field');
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
      await updateSensor(sensorId, {
        local,
        tempDesejada: desiredTemp
      });
      Alert.alert('Success', 'Sensor updated successfully');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to update sensor: ' + e.message);
    }
    setLoading(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Sensor',
      'Are you sure you want to delete this sensor? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteSensor(sensorId);
              Alert.alert('Success', 'Sensor deleted successfully');
              navigation.goBack();
            } catch (e) {
              Alert.alert('Error', 'Failed to delete sensor: ' + e.message);
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  if (initialLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading sensor data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Sensor ID</Text>
      <TextInput
        style={[styles.input, styles.readOnlyInput]}
        value={id}
        editable={false}
        placeholder="Sensor ID (cannot be changed)"
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
          title={loading ? 'Updating...' : 'Update Sensor'} 
          onPress={handleSubmit} 
          disabled={loading}
          color="#2196F3"
        />
      </View>

      <View style={styles.deleteButtonContainer}>
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={handleDelete}
          disabled={loading}
        >
          <Text style={styles.deleteButtonText}>Delete Sensor</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.note}>
        * Required fields{'\n'}
        Sensor ID cannot be changed{'\n'}
        Current temperature is set by the sensor hardware{'\n'}
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
  readOnlyInput: {
    backgroundColor: '#f0f0f0',
    color: '#666',
    borderColor: '#ccc'
  },
  buttonContainer: {
    marginTop: 30,
    marginBottom: 20
  },
  deleteButtonContainer: {
    marginTop: 10,
    marginBottom: 20
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  note: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
    color: '#666'
  }
}); 