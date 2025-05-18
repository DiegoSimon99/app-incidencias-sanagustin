import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getUserData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem("@user_data");
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error("Error al leer los datos del usuario:", error);
  }
};

export const clearUserData = async () => {
  try {
    await AsyncStorage.removeItem("@user_data");
  } catch (error) {
    console.error("Error al borrar los datos del usuario:", error);
  }
};
