// src/api.js
import axios from 'axios';

// Uwaga: W emulatorze Android "localhost" nie odnosi się do Twojego komputera.
// Jeśli Twój backend działa na komputerze, użyj adresu IP lub specjalnego aliasu.
// Dla Android Emulatora często używa się "10.0.2.2" zamiast "localhost".
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaXNwYXRjaGVyMSIsInJvbGUiOiJkaXNwYXRjaGVyIiwiZXhwIjoxNzM4NzUyOTg2fQ._nfsqayUFK1CSp7NePqMRDAHJXHu4spobaZ79Z8kzKQ';
const api = axios.create({
  baseURL: 'http://10.0.2.2:8000/api', // <- Zmień port/adres na ten, którego używasz w backendzie!
  headers: {
    Authorization: `Bearer ${TEST_TOKEN}`,
  },
});

export default api;
