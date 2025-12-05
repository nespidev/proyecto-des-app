import { useState } from "react";
import { View, ScrollView, Text, TextInput, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Yup from 'yup';
import { Formik } from "formik";
import Button from "../../../components/Button";
import Link from "@/components/Link";
import { SafeAreaView } from "react-native-safe-area-context";
import { globalStyles } from "../../../utils/globalStyles";
import { AUTH_ROUTES } from "@/utils/constants";
import { supabase } from "@/utils/supabase";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const ValidationSchema = Yup.object().shape({
  email: Yup.string().email("Email inválido").required("El email es obligatorio"),
  password: Yup.string().required("La contraseña es obligatoria"),
});

export default function Login() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleGoToRegister = () => {
    navigation.navigate(AUTH_ROUTES.REGISTER as never);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={globalStyles.title}>Ingreso de Usuario</Text>
          
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={ValidationSchema}
            onSubmit={async (values) => {
              setLoading(true);
              try {
                // El AuthProvider escuchara el cambio de sesion
                const { error } = await supabase.auth.signInWithPassword({
                  email: values.email,
                  password: values.password,
                });

                if (error) throw error;
              } catch (error: any) {
                Alert.alert("Error", error.message || "Credenciales incorrectas");
                setLoading(false); // Solo quitamos loading si hubo error
              }
            }}
          >
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
              <View style={styles.formContainer}>
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

                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    value={values.password}
                    placeholder="Password"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                    <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={24} color="gray" />
                  </TouchableOpacity>
                </View>
                {errors.password && touched.password && <Text style={styles.error}>{errors.password}</Text>}

                <View style={{ marginTop: 20 }}>
                  {loading ? (
                    <ActivityIndicator size="large" color="#F87018" />
                  ) : (
                    <Button title="Ingresar" onPress={handleSubmit as any} />
                  )}
                </View>
              </View>
            )}
          </Formik>
          
          <View style={{ marginTop: 20 }}>
            <Link link="Ir a Registro" onPress={handleGoToRegister}/>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  formContainer: {
    width: "100%",
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    width: "100%",
    backgroundColor: '#FAFAFA'
  },
  error: {
    color: "red",
    marginBottom: 8,
    alignSelf: 'flex-start'
  },
  label: {
    ...globalStyles.label,
    alignSelf: "flex-start",
    marginBottom: 4,
    marginLeft: 4,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 8,
    gap: 10
  }
});