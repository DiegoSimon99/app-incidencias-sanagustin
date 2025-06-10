import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import NewIncidentForm from "./screens/NewIncidenciaScreen";
import DetalleIncidenciaScreen from "./screens/DetalleIncidenciaScreen";
import CustomDrawerContent from "./components/CustomDrawerContent";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearUserData } from "./utils/auth";
import { StatusBar } from "react-native";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function MainNavigator({ navigation }) {
  const handleLogout = async () => {
    try {
      await clearUserData();
      navigation.replace("Login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <Drawer.Navigator initialRouteName="Inicio" drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen
        name="Inicio"
        component={HomeScreen}
        options={{
          drawerLabel: "Mis Incidencias",
          title: "Mis Incidencias",
          headerStyle: {
            backgroundColor: "#007bff", 
          },
          headerTintColor: "#fff",
        }}
      />
      <Drawer.Screen
        name="Cerrar sesión"
        component={HomeScreen}
        options={{
          drawerLabel: "Cerrar sesión",
          title: "Cerrar sesión",
        }}
        listeners={{
          focus: () => handleLogout(navigation),
        }}
      />
    </Drawer.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const user = await AsyncStorage.getItem("@user_data");
        setIsLoggedIn(!!user);
      } catch (error) {
        console.error("Error verificando sesión:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
  }, []);

  if (loading) {
    return null; // Puedes agregar un spinner aquí si prefieres
  }

  return (
    <>
      <StatusBar barStyle="auto" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: "#007bff", // Cambia al color que desees
            },
            headerTintColor: "#fff", // Cambia el color del texto e íconos del headers
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Main" component={MainNavigator} options={{ title: "", headerShown: false }} />
          <Stack.Screen
            name="NewIncidenciaScreen"
            component={NewIncidentForm}
            options={{ title: "Nueva Incidencia" }}
          />
          <Stack.Screen
            name="DetalleIncidenciaScreen"
            component={DetalleIncidenciaScreen}
            options={{ title: "Detalle de Incidencia" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
