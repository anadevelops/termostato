const BASE_URL = 'http://192.168.15.10:8080';

// Get Thermostats
export const getThermostats = async () => {
  const res = await fetch(`${BASE_URL}/config/`);
  if (!res.ok) throw new Error('Failed to fetch thermostats');
  return await res.json();
};

// Add Thermostat
export const addThermostat = async (thermostat) => {
  const res = await fetch(`${BASE_URL}/config/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(thermostat),
  });
  if (!res.ok) throw new Error('Failed to add thermostat');
  return await res.text();
};

// Get Thermostat
export const getThermostat = async (id) => {
  const res = await fetch(`${BASE_URL}/config/${id}`);
  if (!res.ok) throw new Error('Failed to fetch thermostat');
  return await res.json();
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