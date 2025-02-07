// src/api.js
import axios from 'axios';

// Uwaga: W emulatorze Android "localhost" nie odnosi się do Twojego komputera.
// Jeśli Twój backend działa na komputerze, użyj adresu IP lub specjalnego aliasu.
// Dla Android Emulatora często używa się "10.0.2.2" zamiast "localhost".
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaXNwYXRjaGVyMSIsInJvbGUiOiJkaXNwYXRjaGVyIiwiZXhwIjoxNzM4ODI1ODYwfQ.nSEy100J1TUHzqZPx6zTTJSzlUWvvh2fPX-9jNBdGUQ';
const api = axios.create({
  baseURL: 'http://10.0.2.2:8000/api', // <- Zmień port/adres na ten, którego używasz w backendzie!
  headers: {
    Authorization: `Bearer ${TEST_TOKEN}`,
  },
});

export default api;
