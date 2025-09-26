import React from "react";
import { View, ScrollView, Text, TextInput, StyleSheet } from "react-native";
import {useNavigation} from "@react-navigation/native";
import * as Yup from 'yup';
import { Formik } from "formik";
import Button from "../../../components/Button";
import Link from "@/components/Link";
import { SafeAreaView } from "react-native-safe-area-context";
import { globalStyles } from "../../../utils/globalStyles";
import { AUTH_ROUTES } from "@/utils/constants";

const ValidationSchema = Yup.object().shape({
  email: Yup.string().email("Email inválido").required("El email es obligatorio"),
  password: Yup.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(50, "La contraseña es demasiado larga")
    .required("La contraseña es obligatoria"),
});

export default function Login() {
  const navigation = useNavigation();

  const handleGoToRegister = () => {
    navigation.navigate(AUTH_ROUTES.REGISTER);
  }
  return (

    <ScrollView keyboardShouldPersistTaps="handled">
      <SafeAreaView style={styles.container}>
        <Text style={globalStyles.title}>Ingreso de Usuario</Text>
        <Formik
          initialValues={{ email: '', password: '', nombre: '', apellido: '' }}
          validationSchema={ValidationSchema}
          onSubmit={(values) => {
            console.log("Datos enviados:", values);
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
            <View style={styles.formContainer}>

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
                placeholder="Email"
                keyboardType="email-address"
              />
              {errors.email && touched.email && <Text style={styles.error}>{errors.email}</Text>}

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
                placeholder="Password"
                secureTextEntry
              />
              {errors.password && touched.password && <Text style={styles.error}>{errors.password}</Text>}

              <Button title="Ingresar" onPress={handleSubmit as any} disabled={isSubmitting} />
            </View>
          )}
        </Formik>
        <Link link="Ir a Regsitro" onPress={handleGoToRegister}/>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  formContainer: {
    width: "100%",
    marginTop: 20,
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 8,
    borderRadius: 8,
    width: "100%"
  },
  error: {
    color: "red",
    marginBottom: 8,
  },
  label: {
    ...globalStyles.label,
    alignSelf: "flex-start",
    marginBottom: 4,
    marginLeft: 4,
  },


});
