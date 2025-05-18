// src/screens/HomeScreen.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const [incidencias, setIncidencias] = useState([]);
  const [id_perfil, setIdPerfil] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL || Constants.manifest?.extra?.API_BASE_URL;

  const fetchIncidencias = async () => {
    try {
      const userData = await AsyncStorage.getItem("@user_data");
      const user = JSON.parse(userData);
      setIdPerfil(user.id_perfil);
      const data = {
        id_user: user.id,
        id_perfil: user.id_perfil,
      };
      const response = await axios.post(`${API_BASE_URL}/incidencias/lista`, data);
      if (response.data.success) {
        setIncidencias(response.data.data);
      } else {
        Alert.alert("Error", response.data.message || "No se pudieron cargar las incidencias");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo conectar al servidor");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchIncidencias();
    }, [])
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={incidencias}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("DetalleIncidenciaScreen", { id: item.id })}
            >
              <Image source={{ uri: item.base_url }} style={styles.image} />
              <View style={styles.info}>
                <Text style={styles.titleText}>{item.titulo}</Text>
                <Text style={styles.dateText}>Codigo: {item.codigo}</Text>
                <Text style={styles.dateText}>Fecha: {item.created_at}</Text>
                <Text style={{ color: item.estado.color, fontWeight: "bold" }}>{item.estado.nombre}</Text>
              </View>
            </TouchableOpacity>
          )}
          refreshing={loading}
          onRefresh={fetchIncidencias}
        />
      )}
      {id_perfil == 3 && (
        <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate("NewIncidenciaScreen")}>
          <MaterialIcons name="add" size={30} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  info: {
    flex: 1,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  dateText: {
    fontSize: 14,
    color: "#777",
    marginBottom: 5,
  },
  logoutButton: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 5,
    marginTop: 10,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007bff",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
