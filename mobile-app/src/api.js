const BASE_URL = 'http://192.168.43.89:8080';

// Get Sensors (using config endpoint)
export const getSensors = async () => {
  const res = await fetch(`${BASE_URL}/config/`);
  if (!res.ok) throw new Error('Failed to fetch sensors');
  const data = await res.json();
  // Transform the data to match expected structure for HomeScreen
  return data.map(item => ({
    id: item.id,
    nome: item.local, // Map 'local' to 'nome' for the frontend display
    tempDesejada: item.tempDesejada,
    tempAtual: item.tempAtual
  }));
};

// Add Sensor (using config endpoint)
export const addSensor = async (sensor) => {
  const res = await fetch(`${BASE_URL}/config/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: sensor.id,
      local: sensor.local,
      tempDesejada: sensor.tempDesejada,
      tempAtual: sensor.tempAtual
    }),
  });
  if (!res.ok) throw new Error('Failed to add sensor');
  return await res.text();
};

// Get Thermostat (alias for getSensor)
export const getThermostat = async (id) => {
  const res = await fetch(`${BASE_URL}/config/${id}`);
  if (!res.ok) throw new Error('Failed to fetch thermostat');
  const data = await res.json();
  // Transform the data to match expected structure
  return {
    id: data.id,
    nome: data.local,
    tempDesejada: data.tempDesejada,
    tempAtual: data.tempAtual
  };
};

// Update Sensor (PATCH)
export const updateSensor = async (id, updates) => {
  const res = await fetch(`${BASE_URL}/config/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update sensor');
  return await res.text();
};

// Delete Sensor
export const deleteSensor = async (id) => {
  const res = await fetch(`${BASE_URL}/config/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete sensor');
  return await res.text();
};

// Set Thermostat Temperature
export const setDesiredTemperature = async (id, tempDesejada) => {
  const res = await fetch(`${BASE_URL}/config/tempDesejada/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tempDesejada }),
  });
  if (!res.ok) throw new Error('Failed to set desired temperature');
  return await res.text();
};

// Legacy functions (keeping for compatibility)
export const getThermostats = getSensors;
export const addThermostat = addSensor; 