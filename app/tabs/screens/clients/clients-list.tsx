// app/tabs/screens/clients/clients-list.tsx
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '@/utils/supabase';
import { AuthContext } from "@/shared/context/auth-context";
import { materialColors } from '@/utils/colors';
import { ClientsStackParamList } from './clients-stack';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<ClientsStackParamList, 'ClientsList'>;

interface IClientItem {
  contract_id: string;
  client: {
    id: string;
    nombre: string;
    apellido: string;
    avatar_url: string | null;
  };
  service_name: string;
}

export default function ClientsListScreen() {
  const { state } = useContext<any>(AuthContext);
  const navigation = useNavigation<NavigationProp>();
  const [clients, setClients] = useState<IClientItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    if (!state.user) return;
    setLoading(true);
    
    // Traemos contratos activos + datos del cliente + nombre del servicio
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        id,
        client:profiles!client_id(id, nombre, apellido, avatar_url),
        service:services(title)
      `)
      .eq('professional_id', state.user.id)
      .eq('status', 'active'); // IMPORTANTE: Solo activos

    if (!error && data) {
      // Mapeamos para limpiar la estructura
      const formattedData = data.map((item: any) => ({
        contract_id: item.id,
        client: item.client,
        service_name: item.service?.title || 'Servicio General'
      }));
      setClients(formattedData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const renderItem = ({ item }: { item: IClientItem }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('ClientDashboard', { 
        clientId: item.client.id, 
        clientName: `${item.client.nombre} ${item.client.apellido}` 
      })}
    >
      <Image 
        source={item.client.avatar_url ? { uri: item.client.avatar_url } : require('@/assets/user-predetermiando.png')} 
        style={styles.avatar} 
      />
      <View style={styles.info}>
        <Text style={styles.name}>{item.client.nombre} {item.client.apellido}</Text>
        <Text style={styles.service}>{item.service_name}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="gray" />
    </TouchableOpacity>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={clients}
        keyExtractor={(item) => item.contract_id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tienes clientes activos por el momento.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#eee' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  service: { fontSize: 13, color: '#666', marginTop: 2 },
  emptyText: { textAlign: 'center', marginTop: 40, color: 'gray' }
});