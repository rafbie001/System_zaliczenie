// src/screens/ReportsList.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import api from '../api';

const ReportsList = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Funkcja pobierająca zgłoszenia z backendu
  const fetchReports = useCallback(async () => {
    try {
      const response = await api.get('/dispatches'); // Upewnij się, że endpoint jest poprawny
      setReports(response.data);
    } catch (error) {
      console.error('Błąd pobierania zgłoszeń:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // useEffect z pollingiem - odświeżanie co 10 sekund
  useEffect(() => {
    // Pierwsze pobranie danych
    fetchReports();

    // Ustawienie pollingu co 10 sekund (10 000 ms)
    const interval = setInterval(() => {
      fetchReports();
    }, 10000);

    // Czyszczenie interwału po odmontowaniu komponentu
    return () => clearInterval(interval);
  }, [fetchReports]);

  // Renderowanie pojedynczego elementu listy
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={{ padding: 16, borderBottomWidth: 1, borderColor: '#ccc' }}
      onPress={() => navigation.navigate('ReportDetails', { report: item })}
    >
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Zgłoszenie: {item._id}</Text>
      <Text>Status: {item.status}</Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={reports}
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchReports();
            }}
          />
        }
      />
    </View>
  );
};

export default ReportsList;
