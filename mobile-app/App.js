import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import AddThermostatScreen from './src/screens/AddThermostatScreen';
import ThermostatDetailScreen from './src/screens/ThermostatDetailScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddThermostat" component={AddThermostatScreen} options={{ title: 'Add Thermostat' }} />
        <Stack.Screen name="ThermostatDetail" component={ThermostatDetailScreen} options={{ title: 'Thermostat Details' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 