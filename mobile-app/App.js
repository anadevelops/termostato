import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import AddSensorScreen from './src/screens/AddSensorScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddSensor" component={AddSensorScreen} options={{ title: 'Add Sensor' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 