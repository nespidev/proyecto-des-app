import { useState } from "react";
import { View, ScrollView, Text, TextInput, StyleSheet, Switch, Alert } from "react-native";
import * as Yup from 'yup';
import { Formik } from "formik";
import { Picker } from '@react-native-picker/picker';
import Button from "../../../components/Button";
import Link from "@/components/Link";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { globalStyles } from "../../../utils/globalStyles";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { TouchableOpacity } from "react-native";
import { supabase } from "@/utils/supabase";
import { materialColors } from "@/utils/colors";

export default function Register() {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [isProfessional, setIsProfessional] = useState(false);

  // Validaciones
  const registerSchema = Yup.object().shape({
    nombre: Yup.string().required("El nombre es obligatorio"),
    apellido: Yup.string().required("El apellido es obligatorio"),
    // Validación para el teléfono
    telefono: Yup.string()
      .min(8, "El teléfono debe tener al menos 8 números")
      .required("El teléfono es obligatorio"),
    email: Yup.string().email("Email inválido").required("El email es obligatorio"),
    password: Yup.string().min(8, "Mínimo 8 caracteres").required("Obligatorio"),
    
    // Validación condicional: Profesión requerida, pero Especialidad OPCIONAL
    profesion: Yup.string().when([], {
      is: () => isProfessional,
      then: (schema) => schema.required("Selecciona tu profesión"),
      otherwise: (schema) => schema.notRequired(),
    }),
    especialidad: Yup.string(), 
  });

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Registro de Usuario</Text>
        
        <Formik
          initialValues={{ 
            email: '', 
            password: '', 
            nombre: '', 
            apellido: '', 
            telefono: '', // Nuevo estado inicial
            profesion: 'Entrenador Personal',
            especialidad: '' 
          }}
          validationSchema={registerSchema}
          onSubmit={async (values) => {
            try {
              // Lógica para limpiar la especialidad si está vacía
              const especialidadLimpia = (isProfessional && values.especialidad.trim() !== "") 
                ? values.especialidad 
                : null; 

              const { data, error } = await supabase.auth.signUp({
                email: values.email,
                password: values.password,
                options: {
                  data: {
                    nombre: values.nombre,
                    apellido: values.apellido,
                    telefono: values.telefono, // Enviamos el teléfono a Supabase
                    rol: isProfessional ? 'professional' : 'client',
                    profesion: isProfessional ? values.profesion : null,
                    especialidad: especialidadLimpia, 
                  },
                },
              });

              if (error) throw error;

              if (data.user && !data.session) {
                Alert.alert("¡Registro Exitoso!", "Verifica tu email para confirmar antes de iniciar sesión.");
                navigation.goBack();
              } else if (data.session) {
                 Alert.alert("Bienvenido", "Sesión iniciada.");
              }
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, setFieldValue }) => (
            <View style={styles.formContainer}>
              
              {/* Switch Rol */}
              <View style={styles.switchContainer}>
                <Text style={styles.labelSwitch}>¿Eres Profesional?</Text>
                <Switch 
                  value={isProfessional} 
                  onValueChange={setIsProfessional}
                  trackColor={{ false: "#767577", true: materialColors.schemes.light.primary }}
                />
              </View>

              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                onChangeText={handleChange('nombre')}
                onBlur={handleBlur('nombre')}
                value={values.nombre}
                placeholder="Nombre"
              />
              {errors.nombre && touched.nombre && <Text style={styles.error}>{errors.nombre}</Text>}

              <Text style={styles.label}>Apellido</Text>
              <TextInput
                style={styles.input}
                onChangeText={handleChange('apellido')}
                onBlur={handleBlur('apellido')}
                value={values.apellido}
                placeholder="Apellido"
              />
              {errors.apellido && touched.apellido && <Text style={styles.error}>{errors.apellido}</Text>}

              {/* Nuevo Campo: Teléfono */}
              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={styles.input}
                onChangeText={handleChange('telefono')}
                onBlur={handleBlur('telefono')}
                value={values.telefono}
                placeholder="Ej: +54 9 11..."
                keyboardType="phone-pad" // Teclado numérico
              />
              {errors.telefono && touched.telefono && <Text style={styles.error}>{errors.telefono}</Text>}

              {/* --- CAMPOS PARA PROFESIONALES --- */}
              {isProfessional && (
                <View style={styles.professionalSection}>
                  
                  <Text style={styles.label}>Profesión</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={values.profesion}
                      onValueChange={(itemValue) => setFieldValue('profesion', itemValue)}
                    >
                      <Picker.Item label="Entrenador Personal" value="Entrenador Personal" />
                      <Picker.Item label="Nutricionista" value="Nutricionista" />
                      <Picker.Item label="Médico Deportólogo" value="Médico Deportólogo" />
                      <Picker.Item label="Fisioterapeuta" value="Fisioterapeuta" />
                      <Picker.Item label="Otro" value="Otro" />
                    </Picker>
                  </View>

                  <View style={styles.containerEspecialidad}>
                    <Text style={styles.label}>Especialidad <Text style={styles.optionalText}>(Opcional)</Text></Text>
                    <TextInput
                      style={styles.input}
                      onChangeText={handleChange('especialidad')}
                      onBlur={handleBlur('especialidad')}
                      value={values.especialidad}
                      placeholder="Ej: Crossfit, Dieta Keto..."
                    />
                    {errors.especialidad && touched.especialidad && <Text style={styles.error}>{errors.especialidad}</Text>}
                  </View>
                </View>
              )}

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && touched.email && <Text style={styles.error}>{errors.email}</Text>}
              
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                  placeholder="Mínimo 8 caracteres"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={24} color="gray" />
                </TouchableOpacity>
              </View>
              {errors.password && touched.password && <Text style={styles.error}>{errors.password}</Text>}

              <Button title="Registrar" onPress={handleSubmit as any} disabled={isSubmitting} />
            </View>
          )}
        </Formik>
        <Link link="Volver al Ingreso" onPress={() => navigation.goBack()}/>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  formContainer: { width: "100%", marginTop: 20, alignItems: "center" },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 8, borderRadius: 8, width: "100%" },
  title: { fontSize: 24, marginBottom: 16, fontWeight: "bold" },
  error: { color: "red", marginBottom: 8, alignSelf: 'flex-start' },
  label: { ...globalStyles.label, alignSelf: "flex-start", marginBottom: 4, marginLeft: 4 },
  passwordContainer: { flexDirection: "row", alignItems: "center", gap: 10, width: "100%" },
  
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
    paddingHorizontal: 5,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8
  },
  labelSwitch: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  professionalSection: { width: '100%', marginBottom: 10 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden'
  },
  optionalText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'normal',
    fontStyle: 'italic'
  },
  containerEspecialidad: { paddingLeft: 16 }
});