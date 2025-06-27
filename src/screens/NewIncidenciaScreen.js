import React, { useState, useEffect, useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import { Dropdown } from "react-native-element-dropdown";
import TagInput from "../components/TagInput";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const NewIncidentForm = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [priority, setPriority] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [students, setStudents] = useState([]);
  const [image, setImage] = useState(null);
  const [userData, setUserData] = useState(null);
  const [startTime, setStartTime] = useState(null);

  const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL || Constants.manifest?.extra?.API_BASE_URL;

  const priorities = [
    {
      label: "BAJA",
      value: "1",
    },
    {
      label: "MEDIA",
      value: "2",
    },
    {
      label: "ALTA",
      value: "3",
    },
  ];

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("@user_data");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          setUserData(parsedUserData);
        }
      } catch (error) {
        console.error("Error al cargar los datos del usuario:", error);
        Alert.alert("Error", "No se pudieron cargar los datos del usuario");
      }
    };

    loadUserData();
    fetchStudents();
  }, []);

  const openImageOptions = () => {
    Alert.alert(
      "Subir Imagen",
      "Elige una opción",
      [
        {
          text: "Tomar Foto",
          onPress: takePhoto,
        },
        {
          text: "Seleccionar de la Galería",
          onPress: pickImage,
        },
        {
          text: "Cancelar",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    console.log(permission);
    if (permission.status !== "granted") {
      Alert.alert("Permiso requerido", "Se necesita permiso para usar la cámara.");
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error al tomar la foto:", error);
      Alert.alert("Error", "No se pudo tomar la foto.");
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/alumnos`);
      if (response.data.success) {
        const studentOptions = response.data.data.map((student) => ({
          label: student.nombre,
          value: student.id.toString(),
        }));
        setStudents(studentOptions);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los alumnos");
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    // Validar que todos los campos estén llenos
    if (!title.trim()) {
      Alert.alert("Error", "El campo Título es obligatorio.");
      return;
    }

    if (!studentId) {
      Alert.alert("Error", "Debe seleccionar un alumno.");
      return;
    }
    if (!priority) {
      Alert.alert("Error", "Debe seleccionar una prioridad.");
      return;
    }
    if (keywords.length === 0) {
      Alert.alert("Error", "Debe agregar al menos una palabra clave.");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Error", "El campo Descripción es obligatorio.");
      return;
    }

    const durationSeconds = Math.floor((Date.now() - startTime) / 1000);

    // Crear el formData
    const formData = new FormData();
    formData.append("user_id", userData.id);
    formData.append("alumno_id", studentId);
    formData.append("prioridad", priority);
    formData.append("palabra_clave", keywords.join(","));
    formData.append("titulo", title);
    formData.append("descripcion", description);
    formData.append("tiempo_formulario", durationSeconds);

    if (image) {
      const filename = image.split("/").pop();
      const filetype = filename.split(".").pop();
      formData.append("file", {
        uri: image,
        name: filename,
        type: `image/${filetype}`,
      });
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/incidencias`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        Alert.alert("Éxito", response.data.message);
        navigation.goBack();
      } else {
        Alert.alert("Error", response.data.message || "Error al registrar la incidencia");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo conectar al servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      resetScrollToCoords={{ x: 0, y: 0 }}
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
    >
      <TextInput placeholder="Título" value={title} onChangeText={setTitle} style={styles.input} />

      <Dropdown
        data={students}
        labelField="label"
        valueField="value"
        placeholder="Seleccione un alumno"
        value={studentId}
        onChange={(item) => {
          setStudentId(item.value);
        }}
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        containerStyle={styles.dropdownContainer}
        search
        searchPlaceholder="Buscar alumno..."
      />

      <Dropdown
        data={priorities}
        labelField="label"
        valueField="value"
        placeholder="Seleccione una prioridad"
        value={priority}
        onChange={(item) => {
          setPriority(item.value);
        }}
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        containerStyle={styles.dropdownContainer}
      />

      <TouchableOpacity onPress={openImageOptions} style={styles.imagePicker}>
        {image ? <Image source={{ uri: image }} style={styles.image} /> : <Text>Seleccionar Imagen</Text>}
      </TouchableOpacity>

      <TagInput tags={keywords} setTags={setKeywords} />

      <TextInput
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
        multiline
        style={styles.textarea}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Guardar</Text>}
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#ffffff",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20, // Asegura que el botón no se corte
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  imagePicker: {
    height: 200,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9f9f9",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
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

export default NewIncidentForm;
