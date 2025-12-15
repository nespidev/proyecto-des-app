import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { materialColors } from '@/utils/colors';

interface Props {
  plan: any;
  maxDays?: number;
  maxItemsPerDay?: number;
}

export default function PlanPreview({ plan, maxDays = 1, maxItemsPerDay = 3 }: Props) {
  if (!plan || !plan.content || !Array.isArray(plan.content) || plan.content.length === 0) {
    return null;
  }

  const isWorkout = plan.type === 'workout';
  const visibleDays = plan.content.slice(0, maxDays);
  const totalDays = plan.content.length;

  return (
    <View>
      {visibleDays.map((day: any, dayIndex: number) => {
        const listItems = isWorkout ? day.exercises : day.meals;
        const safeList = listItems || [];
        const visibleItems = safeList.slice(0, maxItemsPerDay);
        const remainingItems = safeList.length - maxItemsPerDay;
        
        return (
          <View key={dayIndex} style={[
             styles.dayContainer, 
             dayIndex < visibleDays.length - 1 && styles.daySeparator 
          ]}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>
                {day.dayName || `Día ${dayIndex + 1}`}
              </Text>
            </View>

            {/* TABLA DE RUTINA */}
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

            {/* TABLA DE DIETA */}
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

            {remainingItems > 0 && (
              <Text style={styles.moreText}>+ {remainingItems} ítems más...</Text>
            )}
          </View>
        );
      })}

      {totalDays > maxDays && (
         <View style={styles.footerMore}>
            <Ionicons name="documents-outline" size={16} color="#666" style={{marginRight: 6}}/>
            <Text style={styles.footerMoreText}>
               Ver {totalDays - maxDays} días más
            </Text>
         </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dayContainer: {
    marginBottom: 16, // Espacio entre días dentro de la tarjeta
  },
  daySeparator: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 16,
    marginBottom: 16
  },
  
  dayHeader: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center'
  },
  dayTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: '#F5F5F5',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    overflow: 'hidden'
  },

  rowHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 6,
    marginBottom: 6
  },
  row: { flexDirection: 'row', paddingVertical: 6, alignItems: 'center' },
  
  // Columnas
  colName: { flex: 3 },
  colSets: { flex: 1, textAlign: 'center' },
  colReps: { flex: 1, textAlign: 'center' },
  colTime: { flex: 1.2 },
  colFood: { flex: 3 },
  
  colText: { fontSize: 11, fontWeight: '700', color: '#AAA', letterSpacing: 0.5 },
  cellText: { fontSize: 13, color: '#444' },

  moreText: {
    fontSize: 11,
    color: materialColors.schemes.light.primary,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'right'
  },

  // Ajuste del footer para que parezca un botón/badge dentro del card
  footerMore: {
    backgroundColor: '#F9F9F9',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12, // Más redondeado
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'center', // Centrado en la tarjeta
    width: '100%'
  },
  footerMoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666'
  }
});