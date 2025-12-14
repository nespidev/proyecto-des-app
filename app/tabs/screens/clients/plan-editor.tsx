import React, { useState, useContext } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Formik, FieldArray } from 'formik';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { materialColors } from '@/utils/colors';
import { supabase } from '@/utils/supabase';
import { IPlan, IWorkoutDay } from '@/shared/models';
import { AuthContext } from "@/shared/context/auth-context";

// Plantilla inicial para una rutina vacía
const INITIAL_WORKOUT: IPlan = {
  client_id: '',
  professional_id: '',
  type: 'workout',
  title: '',
  description: '',
  is_active: true,
  content: [
    {
      dayName: 'Día 1',
      exercises: [{ name: '', sets: '', reps: '', notes: '' }]
    }
  ] as IWorkoutDay[]
};

export default function PlanEditorScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { state } = useContext<any>(AuthContext);
  const { clientId, existingPlan, planType } = route.params || {};

  const [loading, setLoading] = useState(false);

  // Si editamos, usamos el plan existente. Si es nuevo, usamos la plantilla.
  const initialValues = existingPlan || {
    ...INITIAL_WORKOUT,
    type: planType || 'workout',
    client_id: clientId,
    professional_id: state.user?.id
  };

  const handleSubmit = async (values: IPlan) => {
    setLoading(true);
    try {
      // 1. Si creamos uno nuevo ACTIVO, desactivamos los anteriores de este tipo
      if (values.is_active && !values.id) {
        await supabase
          .from('plans')
          .update({ is_active: false })
          .eq('client_id', values.client_id)
          .eq('type', values.type);
      }

      // 2. Guardar (Upsert maneja Insert o Update si mandas ID)
      const { error } = await supabase
        .from('plans')
        .upsert({
          ...values,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      Alert.alert("Éxito", "Plan guardado correctamente");
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ handleChange, handleBlur, handleSubmit, values, setFieldValue }) => (
          <View style={{ flex: 1 }}>
            <ScrollView style={styles.scroll}>
              
              {/* --- CABECERA DEL PLAN --- */}
              <View style={styles.section}>
                <Text style={styles.label}>Título de la Rutina</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Hipertrofia Fase 1"
                  onChangeText={handleChange('title')}
                  onBlur={handleBlur('title')}
                  value={values.title}
                />
                
                <Text style={styles.label}>Descripción (Opcional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Notas generales..."
                  onChangeText={handleChange('description')}
                  value={values.description}
                  multiline
                />
              </View>

              {/* --- DÍAS Y EJERCICIOS (FieldArray Nivel 1) --- */}
              <FieldArray name="content">
                {({ push: addDay, remove: removeDay }) => (
                  <View>
                    {(values.content as IWorkoutDay[]).map((day, dayIndex) => (
                      <View key={dayIndex} style={styles.dayCard}>
                        
                        {/* Header del Día + Botón Borrar Día */}
                        <View style={styles.rowBetween}>
                          <TextInput
                            style={[styles.input, { flex: 1, fontWeight: 'bold' }]}
                            placeholder="Nombre del día (ej: Pierna)"
                            value={day.dayName}
                            onChangeText={handleChange(`content.${dayIndex}.dayName`)}
                          />
                          <TouchableOpacity onPress={() => removeDay(dayIndex)}>
                            <Ionicons name="trash-outline" size={24} color="red" />
                          </TouchableOpacity>
                        </View>

                        {/* --- LISTA DE EJERCICIOS (FieldArray Nivel 2) --- */}
                        <FieldArray name={`content.${dayIndex}.exercises`}>
                          {({ push: addEx, remove: removeEx }) => (
                            <View>
                              {day.exercises.map((exercise, exIndex) => (
                                <View key={exIndex} style={styles.exerciseRow}>
                                  <View style={{ flex: 3, marginRight: 8 }}>
                                    <Text style={styles.subLabel}>Ejercicio</Text>
                                    <TextInput
                                      style={styles.smallInput}
                                      placeholder="Nombre"
                                      value={exercise.name}
                                      onChangeText={handleChange(`content.${dayIndex}.exercises.${exIndex}.name`)}
                                    />
                                  </View>
                                  <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.subLabel}>Series</Text>
                                    <TextInput
                                      style={styles.smallInput}
                                      placeholder="4"
                                      value={exercise.sets}
                                      keyboardType="numeric"
                                      onChangeText={handleChange(`content.${dayIndex}.exercises.${exIndex}.sets`)}
                                    />
                                  </View>
                                  <View style={{ flex: 1 }}>
                                    <Text style={styles.subLabel}>Reps</Text>
                                    <TextInput
                                      style={styles.smallInput}
                                      placeholder="12"
                                      value={exercise.reps}
                                      onChangeText={handleChange(`content.${dayIndex}.exercises.${exIndex}.reps`)}
                                    />
                                  </View>
                                  {/* Botón X para ejercicio */}
                                  <TouchableOpacity onPress={() => removeEx(exIndex)} style={{ justifyContent: 'flex-end', marginLeft: 5, paddingBottom: 10 }}>
                                     <Ionicons name="close-circle" size={20} color="gray" />
                                  </TouchableOpacity>
                                </View>
                              ))}

                              <TouchableOpacity 
                                style={styles.addExButton}
                                onPress={() => addEx({ name: '', sets: '', reps: '' })}
                              >
                                <Text style={styles.addExText}>+ Agregar Ejercicio</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </FieldArray>
                      </View>
                    ))}

                    <TouchableOpacity 
                      style={styles.addDayButton} 
                      onPress={() => addDay({ dayName: `Día ${(values.content.length + 1)}`, exercises: [] })}
                    >
                      <Text style={styles.addDayText}>+ AÑADIR DÍA DE ENTRENAMIENTO</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </FieldArray>

            </ScrollView>

            {/* --- FOOTER FLOTANTE --- */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.saveButton} onPress={() => handleSubmit()}>
                <Text style={styles.saveButtonText}>
                   {loading ? "Guardando..." : "GUARDAR RUTINA"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Formik>
    </View>
  );
}

// Estilos básicos para que se vea limpio
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { flex: 1, padding: 16 },
  section: { marginBottom: 20, backgroundColor: 'white', padding: 16, borderRadius: 12 },
  dayCard: { marginBottom: 20, backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#eee' },
  label: { fontSize: 14, color: '#666', marginBottom: 4 },
  subLabel: { fontSize: 10, color: '#999', marginBottom: 2 },
  input: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 12 },
  smallInput: { backgroundColor: '#f9f9f9', padding: 8, borderRadius: 6, fontSize: 14 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  exerciseRow: { flexDirection: 'row', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 8 },
  addExButton: { alignItems: 'center', padding: 10 },
  addExText: { color: materialColors.schemes.light.primary, fontWeight: 'bold' },
  addDayButton: { backgroundColor: '#e0e0e0', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 100 },
  addDayText: { color: '#333', fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#eee' },
  saveButton: { backgroundColor: materialColors.schemes.light.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});