import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CustomDrawerContent = (props) => {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem("@user_data");
        const user = JSON.parse(userData);
        if (user && user.nombre) {
          setUserName(user.nombre);
        }
      } catch (error) {
        console.error("Error cargando datos del usuario:", error);
      }
    };

    loadUserData();
  }, []);

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.headerContainer}>
        <Text style={styles.greeting}>👋 Hola, {userName}</Text>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
    marginBottom: 15,
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007bff",
    textAlign: "center",
  },
});

export default CustomDrawerContent;
