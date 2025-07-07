import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { getThermostats } from '../api';

export default function HomeScreen({ navigation }) {
  const [thermostats, setThermostats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getThermostats();
        setThermostats(data);
      } catch (e) {
        setThermostats([]);
      }
      setLoading(false);
    };
    const unsubscribe = navigation.addListener('focus', fetchData);
    return unsubscribe;
  }, [navigation]);

  if (loading) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Button title="Add Thermostat" onPress={() => navigation.navigate('AddThermostat')} />
      <FlatList
        data={thermostats}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('ThermostatDetail', { id: item.id })}>
            <View style={styles.item}>
              <Text style={styles.title}>{item.local}</Text>
              <Text>Current: {item.tempAtual}°C | Desired: {item.tempDesejada}°C</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  item: { padding: 16, borderBottomWidth: 1, borderColor: '#ccc' },
  title: { fontWeight: 'bold', fontSize: 16 },
}); 