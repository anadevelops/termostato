import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getSensors, getThermostat, setDesiredTemperature } from '../api';

export default function HomeScreen({ navigation }) {
  const [sensors, setSensors] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [currentTemp, setCurrentTemp] = useState('--');
  const [desiredTemp, setDesiredTemp] = useState('--');
  const [showSensorPicker, setShowSensorPicker] = useState(false);

  // Load sensors on mount and when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('HomeScreen focused - reloading sensors');
      const params = navigation.getState()?.routes?.find(route => route.name === 'Home')?.params;
      const newSensorId = params?.newSensorId;
      
      if (newSensorId) {
        // Clear the parameter to avoid selecting it again
        navigation.setParams({ newSensorId: undefined });
        // Load sensors and select the new one
        loadSensorsAndSelect(newSensorId);
      } else {
        loadSensors();
      }
    }, [navigation])
  );

  // Update temperatures immediately when sensor selection changes
  useEffect(() => {
    if (selectedSensor) {
      updateTemperatures();
    }
  }, [selectedSensor]);

  // Poll for temperature updates every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedSensor) {
        updateTemperatures();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedSensor]);

  const loadSensors = async () => {
    try {
      const data = await getSensors();
      console.log('Loaded sensors:', data);
      console.log('Current selectedSensor:', selectedSensor);
      setSensors(data);
      
      // Clear selection if no sensors available
      if (data.length === 0) {
        console.log('No sensors available, clearing selection');
        setSelectedSensor(null);
        return;
      }
      
      // If no sensor is selected or the selected sensor no longer exists, select the first one
      if (!selectedSensor || !data.find(s => s.id === selectedSensor)) {
        console.log('Selecting first sensor:', data[0].id);
        setSelectedSensor(data[0].id);
      } else {
        console.log('Keeping current selection:', selectedSensor);
      }
    } catch (e) {
      console.log('Error loading sensors:', e);
    }
  };

  const loadSensorsAndSelect = async (sensorIdToSelect) => {
    try {
      const data = await getSensors();
      setSensors(data);
      if (data.find(s => s.id === sensorIdToSelect)) {
        setSelectedSensor(sensorIdToSelect);
      } else if (data.length > 0) {
        // Fallback to first sensor if the specified one doesn't exist
        setSelectedSensor(data[0].id);
      } else {
        setSelectedSensor(null);
      }
    } catch (e) {
      console.log('Error loading sensors:', e);
    }
  };

  const updateTemperatures = async () => {
    if (!selectedSensor) return;
    
    try {
      const data = await getThermostat(selectedSensor);
      setCurrentTemp(data.tempAtual !== null ? data.tempAtual : '--');
      setDesiredTemp(data.tempDesejada || '--');
    } catch (e) {
      console.log('Error updating temperatures:', e);
    }
  };

  const changeDesiredTemp = async (delta) => {
    if (selectedSensor && typeof desiredTemp === 'number') {
      const newTemp = desiredTemp + delta;
      
      try {
        // Send the update to the server
        await setDesiredTemperature(selectedSensor, newTemp);
        
        // Update the local state immediately
        setDesiredTemp(newTemp);
        
        // Then fetch the latest data to confirm
        updateTemperatures();
      } catch (e) {
        Alert.alert('Error', 'Failed to update temperature');
        // Reload to get correct value if update failed
        updateTemperatures();
      }
    }
  };

  const getSelectedSensorName = () => {
    const sensor = sensors.find(s => s.id === selectedSensor);
    return sensor ? sensor.nome : 'No sensors available';
  };

  return (
    <View style={styles.container}>
      {/* Sensor select and add */}
      <View style={styles.topRow}>
        <TouchableOpacity 
          style={styles.sensorSelector} 
          onPress={() => setShowSensorPicker(!showSensorPicker)}
        >
          <Text style={styles.sensorText}>{getSelectedSensorName()}</Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>
        
        {showSensorPicker && (
          <View style={styles.pickerDropdown}>
            {sensors.map(sensor => (
              <TouchableOpacity
                key={sensor.id}
                style={styles.pickerItem}
                onPress={() => {
                  setSelectedSensor(sensor.id);
                  setShowSensorPicker(false);
                }}
              >
                <Text style={styles.pickerItemText}>{sensor.nome}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditSensor', { sensorId: selectedSensor })}>
          <Text style={styles.editButtonText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddSensor')}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      
      {/* Temperatures */}
      <View style={styles.center}>
        {sensors.length === 0 ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>No Sensors Available</Text>
            <Text style={styles.errorMessage}>Add a sensor to get started</Text>
          </View>
        ) : currentTemp === '--' ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Sensor Unavailable</Text>
            <Text style={styles.errorMessage}>The sensor hasn't reported a temperature reading yet</Text>
          </View>
        ) : (
          <>
            <Text style={styles.currentTemp}>{currentTemp}°C</Text>
            <View style={styles.tempRow}>
              <TouchableOpacity style={styles.tempButton} onPress={() => changeDesiredTemp(-1)}>
                <Text style={styles.tempButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.desiredTemp}>{desiredTemp}°C</Text>
              <TouchableOpacity style={styles.tempButton} onPress={() => changeDesiredTemp(1)}>
                <Text style={styles.tempButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingTop: 40, 
    backgroundColor: '#fff' 
  },
  topRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginHorizontal: 16,
    position: 'relative'
  },
  sensorSelector: { 
    flex: 1, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  sensorText: { 
    fontSize: 16, 
    color: '#333' 
  },
  dropdownArrow: { 
    fontSize: 12, 
    color: '#666' 
  },
  pickerDropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 60,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    zIndex: 1000,
    elevation: 5
  },
  pickerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  pickerItemText: {
    fontSize: 16,
    color: '#333'
  },
  editButton: { 
    marginLeft: 8, 
    backgroundColor: '#2196F3', 
    borderRadius: 15, 
    width: 30, 
    height: 30, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  editButtonText: { 
    color: '#fff', 
    fontSize: 12, 
    fontWeight: 'bold' 
  },
  addButton: { 
    marginLeft: 8, 
    backgroundColor: '#2196F3', 
    borderRadius: 15, 
    width: 30, 
    height: 30, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  addButtonText: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  center: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'flex-start',
    paddingTop: 140
  },
  currentTemp: { 
    fontSize: 24, 
    color: '#888', 
    marginBottom: 8 
  },
  tempRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  tempButton: { 
    backgroundColor: '#eee', 
    borderRadius: 20, 
    width: 40, 
    height: 40, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginHorizontal: 16 
  },
  tempButtonText: { 
    fontSize: 28, 
    color: '#2196F3' 
  },
  desiredTemp: { 
    fontSize: 48, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
    textAlign: 'center'
  },
  errorMessage: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22
  }
}); 