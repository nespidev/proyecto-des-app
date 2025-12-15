import React, { useState, useContext } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Formik, FieldArray } from 'formik';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { materialColors } from '@/utils/colors';
import { supabase } from '@/utils/supabase';
import { IPlan, IWorkoutDay, IDietDay } from '@/shared/models'; // Asegúrate de exportar IDietDay
import { AuthContext } from "@/shared/context/auth-context";

// --- PLANTILLAS INICIALES ---
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

const INITIAL_DIET: IPlan = {
  client_id: '',
  professional_id: '',
  type: 'diet',
  title: '',
  description: '',
  is_active: true,
  content: [
    {
      dayName: 'Menú Diario',
      meals: [{ time: '', foods: [{ name: '', quantity: '' }] }]
    }
  ] as IDietDay[] // Tipado como dieta
};

export default function PlanEditorScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { state } = useContext<any>(AuthContext);
  const { clientId, existingPlan, planType } = route.params || {};

  const [loading, setLoading] = useState(false);

  // Determinamos qué tipo estamos editando
  // Si existe plan, usamos su tipo. Si es nuevo, usamos el parámetro o default 'workout'
  const currentType = existingPlan?.type || planType || 'workout';
  const isWorkout = currentType === 'workout';

  // Configuración inicial dinámica
  const initialValues = existingPlan || {
    ...(isWorkout ? INITIAL_WORKOUT : INITIAL_DIET),
    type: currentType,
    client_id: clientId,
    professional_id: state.user?.id
  };

  const handleSubmit = async (values: IPlan) => {
    setLoading(true);
    try {
      // 1. Desactivar anteriores si este es nuevo y activo
      if (values.is_active && !values.id) {
        await supabase
          .from('plans')
          .update({ is_active: false })
          .eq('client_id', values.client_id)
          .eq('type', values.type);
      }

      // 2. Guardar
      const { error } = await supabase
        .from('plans')
        .upsert({
          ...values,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      Alert.alert("Éxito", `${isWorkout ? 'Rutina' : 'Dieta'} guardada correctamente`);
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize>
        {({ handleChange, handleBlur, handleSubmit, values, setFieldValue }) => (
          <View style={{ flex: 1 }}>
            <ScrollView style={styles.scroll}>
              
              {/* --- CABECERA GENERAL --- */}
              <View style={styles.section}>
                <Text style={styles.label}>Título del Plan ({isWorkout ? 'Rutina' : 'Dieta'})</Text>
                <TextInput
                  style={styles.input}
                  placeholder={isWorkout ? "Ej: Hipertrofia Fase 1" : "Ej: Dieta Keto"}
                  onChangeText={handleChange('title')}
                  onBlur={handleBlur('title')}
                  value={values.title}
                />
                
                <Text style={styles.label}>Descripción / Notas</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Instrucciones generales..."
                  onChangeText={handleChange('description')}
                  value={values.description}
                  multiline
                />
              </View>

              {/* --- DÍAS (FieldArray Nivel 1) --- */}
              <FieldArray name="content">
                {({ push: addDay, remove: removeDay }) => (
                  <View>
                    {values.content.map((day: any, dayIndex: number) => (
                      <View key={dayIndex} style={styles.dayCard}>
                        
                        {/* Header del Día */}
                        <View style={styles.rowBetween}>
                          <TextInput
                            style={[styles.input, { flex: 1, fontWeight: 'bold', marginBottom: 0 }]}
                            placeholder={isWorkout ? "Nombre del día (ej: Pierna)" : "Nombre (ej: Lunes a Viernes)"}
                            value={day.dayName}
                            onChangeText={handleChange(`content.${dayIndex}.dayName`)}
                          />
                          <TouchableOpacity onPress={() => removeDay(dayIndex)} style={{marginLeft: 10}}>
                            <Ionicons name="trash-outline" size={24} color="red" />
                          </TouchableOpacity>
                        </View>

                        {/* Separador visual */}
                        <View style={{height: 1, backgroundColor: '#eee', marginVertical: 10}} />

                        {/* === LÓGICA CONDICIONAL: WORKOUT vs DIET === */}
                        
                        {/* OPCIÓN A: RUTINA DE EJERCICIOS */}
                        {isWorkout && (
                          <FieldArray name={`content.${dayIndex}.exercises`}>
                            {({ push: addEx, remove: removeEx }) => (
                              <View>
                                {day.exercises?.map((exercise: any, exIndex: number) => (
                                  <View key={exIndex} style={styles.itemRow}>
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
                                        keyboardType="numeric"
                                        value={exercise.sets}
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
                                    <TouchableOpacity onPress={() => removeEx(exIndex)} style={styles.deleteItemIcon}>
                                       <Ionicons name="close-circle" size={22} color="#999" />
                                    </TouchableOpacity>
                                  </View>
                                ))}
                                <TouchableOpacity style={styles.addItemButton} onPress={() => addEx({ name: '', sets: '', reps: '' })}>
                                  <Text style={styles.addItemText}>+ Agregar Ejercicio</Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </FieldArray>
                        )}

                        {/* OPCIÓN B: PLAN DE DIETA */}
                        {!isWorkout && (
                          <FieldArray name={`content.${dayIndex}.meals`}>
                            {({ push: addMeal, remove: removeMeal }) => (
                              <View>
                                {day.meals?.map((meal: any, mealIndex: number) => (
                                  <View key={mealIndex} style={styles.itemRow}>
                                    {/* Input de Hora */}
                                    <View style={{ flex: 1.5, marginRight: 8 }}>
                                      <Text style={styles.subLabel}>Hora/Momento</Text>
                                      <TextInput
                                        style={styles.smallInput}
                                        placeholder="08:00"
                                        value={meal.time}
                                        onChangeText={handleChange(`content.${dayIndex}.meals.${mealIndex}.time`)}
                                      />
                                    </View>
                                    
                                    {/* Input de Comida (Editamos el array 'foods' en la posición 0 simplificado) */}
                                    <View style={{ flex: 3 }}>
                                      <Text style={styles.subLabel}>Comida Principal</Text>
                                      <TextInput
                                        style={styles.smallInput}
                                        placeholder="Ej: 2 Huevos + Tostada"
                                        // Accedemos al primer alimento para simplificar la UI, 
                                        // aunque el modelo soporta array.
                                        value={meal.foods?.[0]?.name || ''} 
                                        onChangeText={(text) => {
                                           // Truco para actualizar el nested array de foods sin complicar Formik
                                           setFieldValue(`content.${dayIndex}.meals.${mealIndex}.foods`, [{ name: text, quantity: '' }]);
                                        }}
                                      />
                                    </View>
                                    
                                    <TouchableOpacity onPress={() => removeMeal(mealIndex)} style={styles.deleteItemIcon}>
                                       <Ionicons name="close-circle" size={22} color="#999" />
                                    </TouchableOpacity>
                                  </View>
                                ))}
                                <TouchableOpacity style={styles.addItemButton} onPress={() => addMeal({ time: '', foods: [{ name: '', quantity: '' }] })}>
                                  <Text style={styles.addItemText}>+ Agregar Comida</Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </FieldArray>
                        )}

                      </View>
                    ))}

                    <TouchableOpacity 
                      style={styles.addDayButton} 
                      onPress={() => {
                         if(isWorkout) {
                            addDay({ dayName: `Día ${(values.content.length + 1)}`, exercises: [] });
                         } else {
                            addDay({ dayName: `Día ${(values.content.length + 1)}`, meals: [] });
                         }
                      }}
                    >
                      <Text style={styles.addDayText}>
                        {isWorkout ? '+ AÑADIR DÍA DE ENTRENAMIENTO' : '+ AÑADIR DÍA DE DIETA'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </FieldArray>

            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity style={styles.saveButton} onPress={() => handleSubmit()}>
                <Text style={styles.saveButtonText}>
                   {loading ? "Guardando..." : `GUARDAR ${isWorkout ? 'RUTINA' : 'DIETA'}`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { flex: 1, padding: 16 },
  section: { marginBottom: 20, backgroundColor: 'white', padding: 16, borderRadius: 12 },
  dayCard: { marginBottom: 20, backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#ddd' },
  label: { fontSize: 14, color: '#666', marginBottom: 6, fontWeight: '600' },
  subLabel: { fontSize: 11, color: '#888', marginBottom: 4 },
  input: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  smallInput: { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8, fontSize: 14, borderWidth: 1, borderColor: '#eee' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  deleteItemIcon: { paddingBottom: 8, paddingLeft: 8 },
  addItemButton: { alignItems: 'center', padding: 12, marginTop: 5, backgroundColor: '#F0F8FF', borderRadius: 8 },
  addItemText: { color: materialColors.schemes.light.primary, fontWeight: 'bold' },
  addDayButton: { backgroundColor: '#e0e0e0', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 100 },
  addDayText: { color: '#333', fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#eee' },
  saveButton: { backgroundColor: materialColors.schemes.light.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});