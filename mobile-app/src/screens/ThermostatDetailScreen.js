import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { getThermostat, setDesiredTemperature } from '../api';

export default function ThermostatDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [thermostat, setThermostat] = useState(null);
  const [newTemp, setNewTemp] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getThermostat(id);
        setThermostat(data);
      } catch (e) {
        setThermostat(null);
      }
    };
    fetchData();
  }, [id]);

  const handleSetTemp = async () => {
    if (!newTemp) return;
    try {
      await setDesiredTemperature(id, newTemp);
      Alert.alert('Desired temperature updated!');
      setThermostat({ ...thermostat, tempDesejada: newTemp });
      setNewTemp('');
    } catch (e) {
      Alert.alert('Error updating temperature');
    }
  };

  if (!thermostat) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{thermostat.local}</Text>
      <Text>Current Temperature: {thermostat.tempAtual}°C</Text>
      <Text>Desired Temperature: {thermostat.tempDesejada}°C</Text>
      <TextInput
        style={styles.input}
        placeholder="Set new desired temperature"
        value={newTemp}
        onChangeText={setNewTemp}
        keyboardType="numeric"
      />
      <Button title="Set Desired Temperature" onPress={handleSetTemp} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontWeight: 'bold', fontSize: 20, marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginVertical: 12, borderRadius: 4 },
}); 