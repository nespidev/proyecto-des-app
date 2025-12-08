import { useState, useContext, useEffect } from "react";
import { Alert } from "react-native";
import { AuthContext } from "@/shared/context/auth-context";
import AUTH_ACTIONS from "@/shared/context/auth-context/enums";
import { supabase } from "@/utils/supabase";

const MIN_WEIGHT = 20;
const MAX_WEIGHT = 300;

export function useWeightMetrics() {
  const { state, dispatch } = useContext<any>(AuthContext);
  const user = state.user;

  const [peso, setPeso] = useState<string>(user?.peso?.toString() || "");
  const [altura, setAltura] = useState(user?.altura?.toString() || "");
  const [weightHistory, setWeightHistory] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    if (user?.id) fetchWeightHistory();
  }, [user?.id]);

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
    let current = parseFloat(peso);
    if (isNaN(current)) current = MIN_WEIGHT;
    let newVal = current + amount;
    if (newVal < MIN_WEIGHT) newVal = MIN_WEIGHT;
    if (newVal > MAX_WEIGHT) newVal = MAX_WEIGHT;
    setPeso(newVal.toFixed(1));
  };

  const handleSaveWeight = async () => {
    if (!user) return;
    const pesoNum = parseFloat(peso);
    
    if (isNaN(pesoNum) || pesoNum < MIN_WEIGHT || pesoNum > MAX_WEIGHT) {
      Alert.alert("Peso inválido", `Ingresa un peso entre ${MIN_WEIGHT}kg y ${MAX_WEIGHT}kg.`);
      return;
    }

    setLoading(true);
    try {
      const fechaActual = new Date().toISOString();
      const pesoHaCambiado = pesoNum !== user.peso;

      await supabase.from('weight_logs').insert({
        user_id: user.id,
        weight: pesoNum,
        recorded_at: fechaActual
      });

      const profileUpdate: any = { peso: pesoNum };
      if (pesoHaCambiado) profileUpdate.fecha_actualizacion_peso = fechaActual;

      const { error } = await supabase.from('profiles').update(profileUpdate).eq('id', user.id);
      if (error) throw error;

      const updatedUser = { 
        ...user, 
        peso: pesoNum,
        fecha_actualizacion_peso: pesoHaCambiado ? fechaActual : user.fecha_actualizacion_peso
      };
      
      dispatch({ type: AUTH_ACTIONS.LOGIN, payload: { user: updatedUser, token: state.token } });
      await fetchWeightHistory();
      
      if (pesoHaCambiado) Alert.alert("¡Actualizado!", `Nuevo peso: ${pesoNum} kg`);
      else Alert.alert("Registrado", "Peso confirmado.");

    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHeight = async (newHeight: string) => {
    const alturaNum = parseFloat(newHeight);
    if (isNaN(alturaNum)) return;

    try {
      await supabase.from('profiles').update({ altura: alturaNum }).eq('id', user.id);
      const updatedUser = { ...user, altura: alturaNum };
      dispatch({ type: AUTH_ACTIONS.LOGIN, payload: { user: updatedUser, token: state.token } });
    } catch (error) {
      console.error(error);
    }
  };

  return {
    peso, setPeso,
    altura, setAltura,
    weightHistory,
    loading, loadingHistory,
    chartKey,
    changeWeight,
    handleSaveWeight,
    handleSaveHeight,
    lastUpdate: user?.fecha_actualizacion_peso
  };
}