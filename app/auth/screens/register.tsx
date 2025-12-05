import { useState } from "react";
import { View, ScrollView, Text, TextInput, StyleSheet, Switch, Alert, Platform, KeyboardAvoidingView } from "react-native";
import * as Yup from 'yup';
import { Formik } from "formik";
import { Picker } from '@react-native-picker/picker';
import Button from "@/components/Button";
import Link from "@/components/Link";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { globalStyles } from "@/utils/globalStyles";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { TouchableOpacity } from "react-native";
import { supabase } from "@/utils/supabase";
import { materialColors } from "@/utils/colors";

export default function Register() {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [isProfessional, setIsProfessional] = useState(false);

  const registerSchema = Yup.object().shape({
    nombre: Yup.string().required("El nombre es obligatorio"),
    apellido: Yup.string().required("El apellido es obligatorio"),
    telefono: Yup.string()
      .min(8, "El teléfono debe tener al menos 8 números")
      .required("El teléfono es obligatorio"),
    email: Yup.string().email("Email inválido").required("El email es obligatorio"),
    password: Yup.string().min(8, "Mínimo 8 caracteres").required("Obligatorio"),
    profesion: Yup.string().when([], {
      is: () => isProfessional,
      then: (schema) => schema.required("Selecciona tu profesión"),
      otherwise: (schema) => schema.notRequired(),
    }),
    especialidad: Yup.string(), 
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} 
      >
        <ScrollView 
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Registro de Usuario</Text>
          
          <Formik
            initialValues={{ 
              email: '', 
              password: '', 
              nombre: '', 
              apellido: '', 
              telefono: '',
              profesion: 'Entrenador Personal',
              especialidad: '' 
            }}
            validationSchema={registerSchema}
            onSubmit={async (values) => {
              try {
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
                      telefono: values.telefono,
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

                <Text style={styles.label}>Teléfono</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={handleChange('telefono')}
                  onBlur={handleBlur('telefono')}
                  value={values.telefono}
                  placeholder="Ej: +54 9 11..."
                  keyboardType="phone-pad"
                />
                {errors.telefono && touched.telefono && <Text style={styles.error}>{errors.telefono}</Text>}
                <View style={styles.switchContainer}>
                  <Text style={styles.labelSwitch}>Crear cuenta Profesional</Text>
                  <Switch 
                    value={isProfessional} 
                    onValueChange={setIsProfessional}
                    trackColor={{ false: "#767577", true: materialColors.schemes.light.primary }}
                  />
                </View>
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
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    value={values.password}
                    placeholder="Mínimo 8 caracteres"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                    <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={24} color="gray" />
                  </TouchableOpacity>
                </View>
                {errors.password && touched.password && <Text style={styles.error}>{errors.password}</Text>}

                <View style={{marginTop: 20, width: '100%', alignItems: 'center'}}>
                    <Button title="Registrar" onPress={handleSubmit as any} disabled={isSubmitting} />
                </View>
              </View>
            )}
          </Formik>
          
          <View style={{marginBottom: 30, marginTop: 10, alignItems: 'center'}}>
             <Link link="Volver al Ingreso" onPress={() => navigation.goBack()}/>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1, 
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40
  },
  title: { 
    fontSize: 24, 
    marginBottom: 24, 
    fontWeight: "bold", 
    textAlign: "center",
    color: '#333'
  },
  formContainer: { 
    width: "100%", 
  },
  input: { 
    borderWidth: 1, 
    borderColor: "#ccc", 
    padding: 12, 
    marginBottom: 12, 
    borderRadius: 8, 
    width: "100%",
    backgroundColor: '#FAFAFA' 
  },
  error: { color: "red", marginBottom: 12, fontSize: 12, marginTop: -8 },
  label: { 
    ...globalStyles.label, 
    alignSelf: "flex-start", 
    marginBottom: 6, 
    marginLeft: 2,
    color: '#555' 
  },
  passwordContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    width: "100%",
    marginBottom: 12,
    gap: 10
  },
  
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE'
  },
  labelSwitch: { fontSize: 16, fontWeight: '600', color: '#333' },
  professionalSection: { width: '100%', marginBottom: 10 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#FAFAFA'
  },
  optionalText: {
    fontSize: 12,
    color: '#888',
    fontWeight: 'normal',
    fontStyle: 'italic'
  },
  containerEspecialidad: { paddingLeft: 16 }
});