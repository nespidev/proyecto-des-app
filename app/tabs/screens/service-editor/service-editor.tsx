import React, { useEffect, useState, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  Switch
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Formik } from 'formik';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';
import { AuthContext } from '@/shared/context/auth-context';
import { ClientsStackParamList } from '../clients/clients-stack'; // Ajusta la ruta si es necesario
import { materialColors } from '@/utils/colors';

// Definimos los tipos
type NavigationProp = NativeStackNavigationProp<ClientsStackParamList, 'ServiceEditor'>;
type RouteProps = RouteProp<ClientsStackParamList, 'ServiceEditor'>;

interface ServiceFormValues {
  title: string;
  description: string;
  price: string;
  duration_minutes: string;
  total_sessions: string;
  validity_days: string;
  modality: 'Remoto' | 'Presencial';
  is_active: boolean;
}

export default function ServiceEditor() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  
  // CORRECCIÓN DE CONTEXTO
  const { state } = useContext(AuthContext);
  const user = state?.user;

  const { serviceId } = route.params;

  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<ServiceFormValues>({
    title: '',
    description: '',
    price: '',
    duration_minutes: '60',
    total_sessions: '1', // Default
    validity_days: '30', // Default
    modality: 'Remoto',
    is_active: true,
  });

  const isEditing = !!serviceId;

  // Cargar datos si estamos editando
  useEffect(() => {
    if (isEditing) {
      fetchServiceDetails();
    }
  }, [serviceId]);

  const fetchServiceDetails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();

      if (error) throw error;

      if (data) {
        setInitialValues({
          title: data.title,
          description: data.description || '',
          price: data.price ? data.price.toString() : '',
          duration_minutes: data.duration_minutes ? data.duration_minutes.toString() : '',
          total_sessions: data.total_sessions ? data.total_sessions.toString() : '1',
          validity_days: data.validity_days ? data.validity_days.toString() : '30',
          modality: data.modality || 'Remoto',
          is_active: data.is_active,
        });
      }
    } catch (error) {
      console.error('Error cargando servicio:', error);
      Alert.alert('Error', 'No se pudo cargar la información del servicio.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: ServiceFormValues) => {
    if (!user) return;

    // Validación básica
    if (!values.title || !values.price || !values.duration_minutes) {
      Alert.alert('Faltan datos', 'El título, precio y duración son obligatorios.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        professional_id: user.id,
        title: values.title,
        description: values.description,
        price: parseFloat(values.price),
        duration_minutes: parseInt(values.duration_minutes),
        // Guardar nuevos campos como enteros
        total_sessions: parseInt(values.total_sessions),
        validity_days: parseInt(values.validity_days),
        modality: values.modality,
        is_active: values.is_active,
        // CORRECCIÓN: Quitamos updated_at para evitar error de columna inexistente
        // updated_at: new Date(), 
      };

      let error;

      if (isEditing) {
        // UPDATE
        const { error: updateError } = await supabase
          .from('services')
          .update(payload)
          .eq('id', serviceId);
        error = updateError;
      } else {
        // INSERT
        const { error: insertError } = await supabase
          .from('services')
          .insert(payload);
        error = insertError;
      }

      if (error) throw error;

      Alert.alert('Éxito', `Servicio ${isEditing ? 'actualizado' : 'creado'} correctamente.`);
      navigation.goBack();

    } catch (err: any) {
      console.error('Error guardando servicio:', err);
      Alert.alert('Error', err.message || 'Hubo un problema al guardar.');
    } finally {
      setLoading(false);
    }
  };

  const modalities = ['Remoto', 'Presencial'];

  if (loading && isEditing && initialValues.title === '') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={materialColors.coreColors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}
        </Text>
        <View style={{ width: 24 }} /> 
      </View>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        onSubmit={handleSave}
      >
        {({ handleChange, handleBlur, handleSubmit, values, setFieldValue }) => (
          <ScrollView contentContainerStyle={styles.formContent}>
            
            {/* Título */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Título del Servicio</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Asesoría Mensual"
                value={values.title}
                onChangeText={handleChange('title')}
                onBlur={handleBlur('title')}
              />
            </View>

            {/* Descripción */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe qué incluye..."
                value={values.description}
                onChangeText={handleChange('description')}
                onBlur={handleBlur('description')}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Fila 1: Precio y Duración */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Precio ($)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={values.price}
                  onChangeText={handleChange('price')}
                  onBlur={handleBlur('price')}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Duración (min)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="60"
                  value={values.duration_minutes}
                  onChangeText={handleChange('duration_minutes')}
                  onBlur={handleBlur('duration_minutes')}
                  keyboardType="numeric"
                />
              </View>
            </View>

             {/* Fila 2: Sesiones y Validez (NUEVO) */}
             <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Cant. Sesiones</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. 8"
                  value={values.total_sessions}
                  onChangeText={handleChange('total_sessions')}
                  onBlur={handleBlur('total_sessions')}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Validez (Días)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. 30"
                  value={values.validity_days}
                  onChangeText={handleChange('validity_days')}
                  onBlur={handleBlur('validity_days')}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Modalidad */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Modalidad</Text>
              <View style={styles.chipContainer}>
                {modalities.map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    style={[
                      styles.chip,
                      values.modality === mode && styles.chipActive
                    ]}
                    onPress={() => setFieldValue('modality', mode)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        values.modality === mode && styles.chipTextActive
                      ]}
                    >
                      {mode}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Switch Activo */}
            <View style={styles.switchContainer}>
              <View>
                <Text style={styles.label}>Estado del Servicio</Text>
                <Text style={styles.helperText}>
                  {values.is_active 
                    ? 'Visible para contratación' 
                    : 'Oculto'}
                </Text>
              </View>
              <Switch
                value={values.is_active}
                onValueChange={(val) => { setFieldValue('is_active', val) }} 
                trackColor={{ false: '#767577', true: materialColors.coreColors.primary + '80' }}
                thumbColor={values.is_active ? materialColors.coreColors.primary : '#f4f3f4'}
                />
            </View>

            {/* Botón Guardar */}
            <TouchableOpacity 
              style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
              onPress={() => handleSubmit()}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {isEditing ? 'Guardar Cambios' : 'Crear Servicio'}
                </Text>
              )}
            </TouchableOpacity>

          </ScrollView>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  backButton: { padding: 4 },
  formContent: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8 },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: { minHeight: 80 },
  chipContainer: { flexDirection: 'row', gap: 10 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  chipActive: {
    backgroundColor: (materialColors.coreColors.primary || '#4A90E2') + '15',
    borderColor: materialColors.coreColors.primary || '#4A90E2',
  },
  chipText: { fontSize: 14, color: '#666' },
  chipTextActive: { color: materialColors.coreColors.primary || '#4A90E2', fontWeight: '600' },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  helperText: { fontSize: 12, color: '#888', marginTop: 4 },
  saveButton: {
    backgroundColor: materialColors.coreColors.primary || '#4A90E2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: materialColors.coreColors.primary || '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});