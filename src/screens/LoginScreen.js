import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = "https://incidenciassanagustin.org/api";

  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await AsyncStorage.getItem("@user_data");
        if (user) {
          navigation.replace("Main");
        }
      } catch (error) {
        console.error("Error verificando sesión:", error);
      }
    };

    checkSession();
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert("Error", "Todos los campos son obligatorios");
        return;
      }

      if (!validateEmail(email)) {
        Alert.alert("Error", "Ingrese un correo electrónico válido");
        return;
      }

      setLoading(true);

      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password,
      });

      const result = response.data;

      if (result.success) {
        await AsyncStorage.setItem("@user_data", JSON.stringify(result.data));
        navigation.replace("Main");
      } else {
        Alert.alert("Error", result.message || "Credenciales inválidas");
      }78
    } catch (error) {
      Alert.alert("Error", "No se pudo conectar al servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/img/logo.png")} style={styles.logo} resizeMode="contain" />
      <TextInput placeholder="Usuario" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f2f2f2",
  },
  logo: { width: 180, height: 200, alignSelf: "center", marginBottom: 70 },
  title: {
    fontSize: 30,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 12,
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
