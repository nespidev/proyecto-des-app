import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { materialColors } from '@/utils/colors';

interface Props {
  plan: any;
  maxDays?: number;       // NUEVO: Cuántos días de la rutina renderizar
  maxItemsPerDay?: number; // Cuántos ejercicios mostrar por día
}

export default function PlanPreview({ plan, maxDays = 1, maxItemsPerDay = 3 }: Props) {
  // Validaciones básicas
  if (!plan || !plan.content || !Array.isArray(plan.content) || plan.content.length === 0) {
    return null;
  }

  const isWorkout = plan.type === 'workout';
  
  // Recortamos la cantidad de días a mostrar según la prop maxDays
  const visibleDays = plan.content.slice(0, maxDays);
  const totalDays = plan.content.length;

  return (
    <View style={styles.container}>
      {visibleDays.map((day: any, dayIndex: number) => {
        // Determinamos los ítems de este día específico
        const listItems = isWorkout ? day.exercises : day.meals;
        const safeList = listItems || [];
        
        // Recorte de ítems por día
        const visibleItems = safeList.slice(0, maxItemsPerDay);
        const remainingItems = safeList.length - maxItemsPerDay;
        
        return (
          <View key={dayIndex} style={[
             styles.dayContainer, 
             // Agregamos un borde separador si no es el último día mostrado
             dayIndex < visibleDays.length - 1 && styles.daySeparator 
          ]}>
            <Text style={styles.dayTitle}>
              {day.dayName || `Día ${dayIndex + 1}`}
            </Text>

            {/* --- TABLA DE RUTINA --- */}
            {isWorkout && (
              <View>
                <View style={styles.rowHeader}>
                  <Text style={[styles.colText, styles.colName]}>Ejercicio</Text>
                  <Text style={[styles.colText, styles.colSets]}>Series</Text>
                  <Text style={[styles.colText, styles.colReps]}>Reps</Text>
                </View>
                {visibleItems.map((ex: any, i: number) => (
                  <View key={i} style={styles.row}>
                    <Text style={[styles.cellText, styles.colName]} numberOfLines={1}>{ex.name}</Text>
                    <Text style={[styles.cellText, styles.colSets]}>{ex.sets}</Text>
                    <Text style={[styles.cellText, styles.colReps]}>{ex.reps}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* --- TABLA DE DIETA --- */}
            {!isWorkout && (
              <View>
                <View style={styles.rowHeader}>
                  <Text style={[styles.colText, styles.colTime]}>Hora</Text>
                  <Text style={[styles.colText, styles.colFood]}>Comida</Text>
                </View>
                {visibleItems.map((meal: any, i: number) => (
                  <View key={i} style={styles.row}>
                    <Text style={[styles.cellText, styles.colTime]}>{meal.time}</Text>
                    <Text style={[styles.cellText, styles.colFood]} numberOfLines={1}>
                       {meal.foods?.[0]?.name || 'Sin especificar'}
                       {meal.foods?.length > 1 ? ' y más...' : ''}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Indicador de "más ejercicios" EN ESTE DÍA */}
            {remainingItems > 0 && (
              <Text style={styles.moreText}>+ {remainingItems} ítems más...</Text>
            )}
          </View>
        );
      })}

      {/* Indicador de "más días" EN EL PLAN TOTAL */}
      {totalDays > maxDays && (
         <View style={styles.footerMore}>
            <Ionicons name="documents-outline" size={16} color="#666" style={{marginRight: 6}}/>
            <Text style={styles.footerMoreText}>
               Y {totalDays - maxDays} días más en este plan
            </Text>
         </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    overflow: 'hidden' // Para que los bordes redondeados corten el contenido
  },
  dayContainer: {
    padding: 10,
  },
  daySeparator: {
    borderBottomWidth: 4, // Separador grueso para distinguir días claramente
    borderBottomColor: '#FFFFFF' // Línea blanca para separar el fondo gris
  },
  dayTitle: {
    fontSize: 12,
    fontWeight: '800', // Más negrita
    color: '#444',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    backgroundColor: '#EFEFEF', // Fondo sutil para el título del día
    paddingVertical: 2,
    paddingHorizontal: 6,
    alignSelf: 'flex-start',
    borderRadius: 4
  },
  rowHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 4,
    marginBottom: 4
  },
  row: { flexDirection: 'row', paddingVertical: 2 },
  
  // Columnas
  colName: { flex: 3 },
  colSets: { flex: 1, textAlign: 'center' },
  colReps: { flex: 1, textAlign: 'center' },
  colTime: { flex: 1.5 },
  colFood: { flex: 3 },
  
  colText: { fontSize: 10, fontWeight: 'bold', color: '#999' },
  cellText: { fontSize: 11, color: '#333' },

  moreText: {
    fontSize: 10,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 2,
    textAlign: 'right'
  },
  footerMore: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  footerMoreText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555'
  }
});