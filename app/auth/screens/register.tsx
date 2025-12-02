import { useState } from "react";
import { View, ScrollView, Text, TextInput, StyleSheet } from "react-native";
import * as Yup from 'yup';
import { Formik } from "formik";
import Button from "../../../components/Button";
import Link from "@/components/Link";
import {useNavigation} from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { globalStyles } from "../../../utils/globalStyles";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { TouchableOpacity } from "react-native";


const ValidationSchema = Yup.object().shape({
  nombre: Yup.string().required("El nombre es obligatorio"),
  apellido: Yup.string().required("El apellido es obligatorio"),
  email: Yup.string().email("Email inválido").required("El email es obligatorio"),
  password: Yup.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(50, "La contraseña es demasiado larga")
    .required("La contraseña es obligatoria"),
});

export default function Register() {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  return (

    <ScrollView keyboardShouldPersistTaps="handled">
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Registro de Usuario</Text>
        <Formik
          initialValues={{ email: '', password: '', nombre: '', apellido: '' }}
          validationSchema={ValidationSchema}
          onSubmit={(values) => {
            console.log("Datos enviados:", values);
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
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
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                  placeholder="Password"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialIcons
                    name={showPassword ? "visibility" : "visibility-off"}
                    size={24}
                    color="gray"
                  />
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
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 8,
    borderRadius: 8,
    width: "100%"
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    fontWeight: "bold",
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
    passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
  },
});
