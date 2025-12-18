import { useState } from "react";
import { View, ScrollView, Text, TextInput, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Yup from 'yup';
import { Formik } from "formik";
import { LinearGradient } from 'expo-linear-gradient'; 
import Button from "@/components/Button";
import Link from "@/components/Link";
import { SafeAreaView } from "react-native-safe-area-context";
import { globalStyles } from "@/utils/globalStyles";
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
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
          bounces={false} 
        >
          
          <LinearGradient
            colors={['#EB8919', '#F2C54A']} 
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <SafeAreaView edges={['top']} style={styles.safeAreaHeader}>
              <Image 
                source={require("@/assets/imagotipo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </SafeAreaView>
          </LinearGradient>

          <View style={styles.bodyContent}>
            <Text style={[globalStyles.title, { marginTop: 10 }]}>Ingresa a la App</Text>
            
            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={ValidationSchema}
              onSubmit={async (values) => {
                setLoading(true);
                try {
                  const { error } = await supabase.auth.signInWithPassword({
                    email: values.email,
                    password: values.password,
                  });

                  if (error) throw error;
                } catch (error: any) {
                  Alert.alert("Error", error.message || "Credenciales incorrectas");
                  setLoading(false);
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

                  <View style={{ marginTop: 20 , alignItems: 'center' }}>
                    {loading ? (
                      <ActivityIndicator size="large" color="#F87018" />
                    ) : (
                      <Button title="Ingresar" onPress={handleSubmit as any} />
                    )}
                  </View>
                </View>
              )}
            </Formik>
            
            <View style={{ marginTop: 20, marginBottom: 40 }}>
              <Link link="Ir a Registro" onPress={handleGoToRegister}/>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: 0, 
  },
  headerGradient: {
    width: '100%',
    alignItems: 'center',
    borderBottomLeftRadius: 40,  
    borderBottomRightRadius: 40, 
    paddingBottom: 60, 
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  safeAreaHeader: {
    width: '100%',
    alignItems: 'center',
  },
  logo: {
    marginTop: 50,
    width: 300,
    height: 300,
    marginBottom: 0, 
  },
  bodyContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
    width: '100%',
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