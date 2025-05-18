import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Button,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dropdown } from "react-native-element-dropdown";
import * as DocumentPicker from "expo-document-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const DetalleIncidenciaScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [incidencia, setIncidencia] = useState(null);
  const [seguimientos, setSeguimientos] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [estadoId, setEstadoId] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingForm, setLoadingForm] = useState(false);
  const [user, setUser] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [estados, setEstados] = useState([]);
  const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL || Constants.manifest?.extra?.API_BASE_URL;

  const fetchIncidenciaDetail = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/incidencias/show/${id}`);
      if (response.data.success) {
        setIncidencia(response.data.data);
        // Actualizar el título del header con el código de la incidencia
        navigation.setOptions({
          title: `#${response.data.data.codigo}`,
        });
      } else {
        Alert.alert("Error", response.data.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo conectar al servidor");
    } finally {
      setLoading(false);
    }
  };

  const fetchSeguimientos = async () => {
    try {
      const response = await axios.get(`${Constants.expoConfig?.extra?.API_BASE_URL}/incidencias/seguimiento/${id}`);
      if (response.data.success) {
        setSeguimientos(response.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchEstados = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/incidencias/status/${id}`);
      if (response.data.success) {
        const statusOptions = response.data.data.map((item) => ({
          label: item.nombre,
          value: item.id.toString(),
        }));
        setEstados(statusOptions);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await AsyncStorage.getItem("@user_data");
      const user = JSON.parse(userData);
      setUser(user);
    };

    fetchIncidenciaDetail();
    fetchSeguimientos();
    fetchUser();
    fetchEstados();
  }, [id, navigation]);

  const handleGuardarSeguimiento = async () => {
    if (!estadoId) {
      Alert.alert("Error", "Debe seleccionar un estado.");
      return;
    }

    if (!descripcion.trim()) {
      Alert.alert("Error", "El campo Descripción es obligatorio.");
      return;
    }

    try {
      setLoadingForm(true);
      const formData = new FormData();
      formData.append("user_id", user.id);
      formData.append("id_incidencia", id);
      formData.append("id_estado", estadoId);
      formData.append("descripcion", descripcion);
      if (archivo) {
        formData.append("file", {
          uri: archivo.uri,
          name: archivo.name,
          type: archivo.type,
        });
      }
      const response = await axios.post(`${API_BASE_URL}/incidencias/seguimiento`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data.success) {
        setDescripcion("");
        setEstadoId("");
        setArchivo(null);
        setModalVisible(false);
        await fetchIncidenciaDetail();
        fetchSeguimientos();
        fetchEstados();
        Alert.alert("Éxito", response.data.message);
      } else {
        Alert.alert("Error", response.data.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo guardar el seguimiento.");
    } finally {
      setLoadingForm(false);
    }
  };

  const handleOpenFile = (url) => {
    if (url) {
      Linking.openURL(url).catch((err) => console.error("Error al abrir el enlace:", err));
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#007bff" style={styles.loading} />;
  }

  if (!incidencia) {
    return <Text style={styles.errorText}>No se encontraron detalles para esta incidencia.</Text>;
  }

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        style={styles.container}
        resetScrollToCoords={{ x: 0, y: 0 }}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
      >
        <ScrollView>
          <Image source={{ uri: incidencia.base_url }} style={styles.image} />
          <View style={styles.contentContainer}>
            <Text style={styles.title}>{incidencia.titulo}</Text>
            <Text style={styles.description}>{incidencia.descripcion}</Text>
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Alumno:</Text>
                <Text style={styles.value}>{incidencia.alumno}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Nivel:</Text>
                <Text style={styles.value}>{incidencia.nivel}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Creador de Incidencia:</Text>
                <Text style={styles.value}>{incidencia.creador}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Fecha de registro:</Text>
                <Text style={styles.value}>{incidencia.fecha}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Estado:</Text>
                <Text style={[styles.value, { color: incidencia.estado.color, fontWeight: "bold" }]}>
                  {incidencia.estado.nombre}
                </Text>
              </View>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.historyTitle}>Historial de Seguimientos</Text>
              {seguimientos.map((item) => (
                <View key={item.id} style={styles.historyItem}>
                  <Text style={styles.historyUser}>{item.usuario}</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.historyDate}>{item.fecha}</Text>
                    <Text style={[styles.historyEstado, { color: item.estado.color, fontWeight: "bold" }]}>
                      {item.estado.nombre}
                    </Text>
                  </View>
                  <Text style={styles.historyDescription}>{item.descripcion || "Sin descripción.. "}</Text>
                  {item.base_url && (
                    <TouchableOpacity onPress={() => handleOpenFile(item.base_url)} style={styles.fileButton}>
                      <Text style={styles.fileButtonText}>Abrir Archivo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
      {user.id_perfil == 2 && (
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.floatingButton}>
          <MaterialIcons name="add" size={30} color="white" />
        </TouchableOpacity>
      )}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Nuevo Seguimiento</Text>
              <Dropdown
                data={estados}
                labelField="label"
                valueField="value"
                placeholder="Seleccione un estado"
                value={estadoId}
                onChange={(item) => {
                  setEstadoId(item.value);
                }}
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                containerStyle={styles.dropdownContainer}
              />
              <TextInput
                placeholder="Descripción"
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
                style={styles.textarea}
              />
              <TouchableOpacity
                style={styles.fileButtonUpload}
                onPress={async () => {
                  try {
                    const result = await DocumentPicker.getDocumentAsync({});
                    if (result.assets && result.assets.length > 0) {
                      const file = result.assets[0]; // Toma el primer archivo del array
                      setArchivo({
                        uri: file.uri,
                        name: file.name,
                        type: file.mimeType || "application/octet-stream",
                      });
                    }
                  } catch (error) {
                    console.error(error);
                    Alert.alert("Error", "No se pudo seleccionar el archivo.");
                  }
                }}
              >
                <Text style={styles.fileButtonTextUpload}>{archivo ? archivo.name : "Seleccionar Archivo"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonSave} onPress={handleGuardarSeguimiento} disabled={loadingForm}>
                {loadingForm ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Guardar</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e7e7e7",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 0,
  },
  image: {
    width: "100%",
    height: 300,
    marginBottom: 20,
    marginTop: 20,
    backgroundColor: "#F9F9F9",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
    color: "#333",
  },
  description: {
    fontSize: 14,
    marginBottom: 15,
    color: "#666",
  },
  infoContainer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 15,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#555",
  },
  value: {
    fontWeight: "normal",
    color: "#333",
  },
  historyTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  historyItem: {
    marginBottom: 10,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 7,
  },
  historyUser: {
    fontWeight: "bold",
    color: "#555",
  },
  historyDate: {
    color: "#999",
    marginBottom: 5,
  },
  historyDescription: {
    color: "#666",
  },
  historyEstado: {
    fontSize: 14,
    marginBottom: 5,
  },
  fileButton: {
    backgroundColor: "#007bff",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 15,
  },
  fileButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  textarea: {
    height: 100,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    textAlignVertical: "top",
  },
  dropdown: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  placeholderStyle: {
    color: "#888",
  },
  selectedTextStyle: {
    color: "#333",
  },
  inputSearchStyle: {
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#EFEFEF",
    borderColor: "#ccc",
  },
  dropdownContainer: {
    borderRadius: 8,
    borderColor: "#ccc",
    backgroundColor: "#ffffff",
  },
  buttonSave: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  buttonCancel: {
    backgroundColor: "red",
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
  fileButtonUpload: {
    backgroundColor: "#f2f2f2",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  fileButtonTextUpload: {
    color: "#333",
    fontWeight: "bold",
  },
});

export default DetalleIncidenciaScreen;
