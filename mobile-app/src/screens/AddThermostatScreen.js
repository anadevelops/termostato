import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { addThermostat } from '../api';

export default function AddThermostatScreen({ navigation }) {
  const [id, setId] = useState('');
  const [local, setLocal] = useState('');
  const [tempDesejada, setTempDesejada] = useState('');
  const [tempAtual, setTempAtual] = useState('');

  const handleAdd = async () => {
    if (!id || !local || !tempDesejada || !tempAtual) {
      Alert.alert('All fields are required');
      return;
    }
    try {
      await addThermostat({ id, local, tempDesejada, tempAtual });
      Alert.alert('Thermostat added!');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error adding thermostat');
    }
  };

  return (
    <View style={styles.container}>
      <Text>ID:</Text>
      <TextInput style={styles.input} value={id} onChangeText={setId} keyboardType="numeric" />
      <Text>Location:</Text>
      <TextInput style={styles.input} value={local} onChangeText={setLocal} />
      <Text>Desired Temperature (°C):</Text>
      <TextInput style={styles.input} value={tempDesejada} onChangeText={setTempDesejada} keyboardType="numeric" />
      <Text>Current Temperature (°C):</Text>
      <TextInput style={styles.input} value={tempAtual} onChangeText={setTempAtual} keyboardType="numeric" />
      <Button title="Add" onPress={handleAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 12, borderRadius: 4 },
}); 