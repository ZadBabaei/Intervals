import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import your screens
import MyHomePage from "./screens/MyHomePage"; // Make sure this path is correct
import TimerScreen from "./screens/TimerScreen"; // Make sure this path is correct
import AddEditIntervalScreen from "./screens/AddEditIntervalScreen";

const Stack = createNativeStackNavigator();

export default function App() {
	return (
		<NavigationContainer>
			<Stack.Navigator
				initialRouteName="Home" // This name must match the name in Stack.Screen
				screenOptions={{
					headerShown: false, // Hide the default header for all screens
					animation: "slide_from_right", // Smooth slide animation
				}}
			>

				<Stack.Screen name="Home" component={MyHomePage} />
				<Stack.Screen name="Timer" component={TimerScreen} />
				<Stack.Screen name="AddEditInterval" component={AddEditIntervalScreen} /> 
			</Stack.Navigator>
		</NavigationContainer>
	);
}
