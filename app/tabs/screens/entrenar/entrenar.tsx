import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, Alert, ScrollView, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions } from "react-native";
import { materialColors } from "@/utils/colors";
import { globalStyles } from "@/utils/globalStyles";
import Button from "@/components/Button";
import { AuthContext } from "@/shared/context/auth-context";
import AUTH_ACTIONS from "@/shared/context/auth-context/enums";
import { supabase } from "@/utils/supabase";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LineChart } from "react-native-gifted-charts";

const screenWidth = Dimensions.get("window").width;

export default function Entrenar() {
  const { state, dispatch } = useContext<any>(AuthContext);
  const user = state.user;

  const [peso, setPeso] = useState(user?.peso?.toString() || ""); 
  const [altura, setAltura] = useState(user?.altura?.toString() || "");
  
  const [loading, setLoading] = useState(false);
  const [isEditingHeight, setIsEditingHeight] = useState(false);
  const [tempAltura, setTempAltura] = useState("");

  const [weightHistory, setWeightHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // estado para forzar la actualizacion del grafico
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    if (user?.id) fetchWeightHistory();
  }, [user?.id]);

  // Sincronizar datos si el usuario se actualiza externamente
  useEffect(() => {
    if (user) {
      if (user.peso) setPeso(user.peso.toString());
      if (user.altura) setAltura(user.altura.toString());
    }
  }, [user]);

  const fetchWeightHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false }) 
        .limit(20);

      if (error) throw error;

      if (data) {
        // invertimos para que el grafico vaya de viejo a nuevo
        const historyChronological = data.reverse();

        const chartData = historyChronological.map(log => ({
          value: log.weight,
          label: new Date(log.recorded_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
          dataPointText: log.weight.toString(),
        }));
        
        setWeightHistory(chartData);
        setChartKey(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const changeWeight = (amount: number) => {
    const current = parseFloat(peso) || 0;
    const newVal = (current + amount).toFixed(1);
    setPeso(newVal);
  };

  const handleSaveWeight = async () => {
    if (!user) return;
    
    const pesoNum = parseFloat(peso);
    if (isNaN(pesoNum)) {
      Alert.alert("Error", "Ingresa un peso válido");
      return;
    }

    setLoading(true);
    try {
      const fechaActual = new Date().toISOString();
      const pesoHaCambiado = pesoNum !== user.peso;

      // Guardar Log en Historial (Siempre, para registrar el "check-in")
      await supabase.from('weight_logs').insert({
        user_id: user.id,
        weight: pesoNum,
        recorded_at: fechaActual
      });

      // Actualizar Perfil
      const profileUpdate: any = { peso: pesoNum };
      if (pesoHaCambiado) {
        profileUpdate.fecha_actualizacion_peso = fechaActual;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Actualizar contexto global
      const updatedUser = { 
        ...user, 
        peso: pesoNum,
        fecha_actualizacion_peso: pesoHaCambiado ? fechaActual : user.fecha_actualizacion_peso
      };
      
      dispatch({ type: AUTH_ACTIONS.LOGIN, payload: { user: updatedUser, token: state.token } });

      // Recargar el historial para que el grafico muestre el nuevo punto
      await fetchWeightHistory();
      
      if (pesoHaCambiado) {
        Alert.alert("¡Actualizado!", `Nuevo peso: ${pesoNum} kg`);
      } else {
        Alert.alert("Registrado", "No hubo cambios en el historial.");
      }

    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHeight = async () => {
    if (!tempAltura) return;
    const alturaNum = parseFloat(tempAltura);
    if (isNaN(alturaNum)) return;

    try {
      await supabase.from('profiles').update({ altura: alturaNum }).eq('id', user.id);
      
      const updatedUser = { ...user, altura: alturaNum };
      dispatch({ type: AUTH_ACTIONS.LOGIN, payload: { user: updatedUser, token: state.token } });
      
      setIsEditingHeight(false);
    } catch (error) {
      console.error(error);
    }
  };

const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Nunca";
    return new Date(dateString).toLocaleString('es-AR', {
      day: 'numeric',
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false // AM/PM
    });
  };

  return (
    <KeyboardAvoidingView 
      style={{flex: 1}} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={globalStyles.title}>Mi Progreso</Text>
          <Text style={globalStyles.subtitle}>Controla tus métricas</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.metricsRow}>
            
            {/* PESO */}
            <View style={styles.weightColumn}>
              <Text style={styles.labelMain}>PESO ACTUAL</Text>
              
              <View style={styles.weightControlContainer}>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.weightInput}
                    value={peso}
                    onChangeText={setPeso}
                    keyboardType="numeric"
                    maxLength={5}
                    placeholder="0.0"
                    placeholderTextColor="#ccc"
                  />
                  <Text style={styles.unit}>kg</Text>
                </View>
                
                {/* Botones de flecha */}
                <View style={styles.arrowsGroup}>
                  <TouchableOpacity onPress={() => changeWeight(0.1)} style={styles.arrowButton}>
                    <MaterialIcons name="keyboard-arrow-up" size={28} color={materialColors.schemes.light.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => changeWeight(-0.1)} style={styles.arrowButton}>
                    <MaterialIcons name="keyboard-arrow-down" size={28} color={materialColors.schemes.light.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              {loading ? (
                 <ActivityIndicator style={{marginTop: 10}} color={materialColors.schemes.light.primary}/>
              ) : (
                <TouchableOpacity style={styles.updateButton} onPress={handleSaveWeight}>
                  <MaterialIcons name="save" size={18} color="white" />
                  <Text style={styles.updateButtonText}>Actualizar</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.verticalDivider} />

            {/* ALTURA */}
            <View style={styles.heightColumn}>
              <Text style={styles.labelSecondary}>ALTURA</Text>
              
              {isEditingHeight ? (
                <View style={styles.heightEditContainer}>
                  <TextInput 
                    style={styles.heightInput} 
                    value={tempAltura} 
                    onChangeText={setTempAltura}
                    keyboardType="numeric"
                    placeholder={altura}
                    autoFocus
                  />
                  <TouchableOpacity onPress={handleSaveHeight}>
                    <MaterialIcons name="check" size={24} color="green" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.heightDisplay}>
                  <Text style={styles.heightValue}>{altura || "--"} <Text style={styles.unitSmall}>cm</Text></Text>
                  <TouchableOpacity onPress={() => { setTempAltura(altura); setIsEditingHeight(true); }} style={styles.editIcon}>
                    <MaterialIcons name="edit" size={14} color="#999" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

          </View>
          
          <Text style={styles.lastUpdate}>
            Última actualización: {formatDate(user?.fecha_actualizacion_peso)}
          </Text>
        </View>

        {/* GRAFICO */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Evolución</Text>
          {loadingHistory ? (
            <ActivityIndicator size="large" color={materialColors.schemes.light.primary} />
          ) : weightHistory.length > 1 ? (
            <View style={styles.chartContainer}>
              <LineChart
                key={chartKey} // Forzamos re-render al actualizar datos
                data={weightHistory}
                color={materialColors.schemes.light.primary}
                thickness={3}
                dataPointsColor={materialColors.schemes.light.primary}
                textColor={materialColors.schemes.light.onSurface}
                xAxisColor={materialColors.schemes.light.outline}
                yAxisColor={materialColors.schemes.light.outline}
                width={screenWidth - 80}
                height={220}
                spacing={40}
                initialSpacing={20}
                hideRules
                // yAxisOffset={Math.min(...weightHistory.map(d => d.value)) - 5}
                yAxisOffset={10}
                curved
                isAnimated
                scrollToEnd
              />
            </View>
          ) : (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyText}>Registra más pesos para ver tu evolución.</Text>
            </View>
          )}
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 20,
    backgroundColor: materialColors.schemes.light.surface,
  },
  headerContainer: { marginBottom: 20, alignItems: 'center' },
  
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 24,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  // COLUMNA PESO
  weightColumn: {
    flex: 2,
    alignItems: 'center',
    paddingRight: 10
  },
  labelMain: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 4,
    letterSpacing: 1
  },
  weightControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginRight: 10
  },
  weightInput: {
    fontSize: 42,
    fontWeight: 'bold',
    color: materialColors.schemes.light.primary,
    minWidth: 80,
    textAlign: 'right',
    padding: 0, 
  },
  unit: { 
    fontSize: 16, 
    color: '#666', 
    fontWeight: 'normal',
    marginBottom: 8, 
    marginLeft: 4
  },
  arrowsGroup: {
    flexDirection: 'column',
    gap: 4
  },
  arrowButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    padding: 2
  },
  updateButton: {
    flexDirection: 'row',
    backgroundColor: materialColors.schemes.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    gap: 6,
  },
  updateButtonText: { color: 'white', fontWeight: 'bold', fontSize: 14 },

  // DIVISOR
  verticalDivider: {
    width: 1,
    height: '70%',
    backgroundColor: '#eee',
    marginHorizontal: 10
  },

  // COLUMNA ALTURA
  heightColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  labelSecondary: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#aaa',
    marginBottom: 6,
    letterSpacing: 1
  },
  heightDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  heightValue: {
    fontSize: 22,
    color: '#555',
    fontWeight: '600'
  },
  unitSmall: { fontSize: 12, color: '#999' },
  editIcon: {
    padding: 6,
    backgroundColor: '#f9f9f9',
    borderRadius: 12
  },
  heightEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  heightInput: {
    borderBottomWidth: 1,
    borderColor: materialColors.schemes.light.primary,
    width: 50,
    textAlign: 'center',
    fontSize: 18
  },
  lastUpdate: {
    marginTop: 16,
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center'
  },
  // GRAFICO
  chartSection: { flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16, color: '#333' },
  chartContainer: { alignItems: 'center', paddingVertical: 10, backgroundColor: '#fff', borderRadius: 16, padding: 10, overflow: 'hidden'},
  emptyChart: { alignItems: 'center', padding: 30, backgroundColor: '#f9f9f9', borderRadius: 12 },
  emptyText: { color: '#888' }
});