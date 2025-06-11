import React, { useEffect } from "react"; 
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";


import MyHomePage from "./screens/MyHomePage";
import TimerScreen from "./screens/TimerScreen";
import AddEditIntervalScreen from "./screens/AddEditIntervalScreen";
import { initDatabase } from "./DB/db"; 

const Stack = createNativeStackNavigator();

export default function App() {

	useEffect(() => {
		initDatabase()
			.then(() => console.log("Database initialized successfully."))
			.catch((err) => console.error("Failed to initialize database:", err));
	}, []); 
	return (
		<NavigationContainer>
			<Stack.Navigator
				initialRouteName="Home"
				screenOptions={{
					headerShown: false,
					animation: "slide_from_right",
				}}
			>
				<Stack.Screen name="Home" component={MyHomePage} />
				<Stack.Screen name="Timer" component={TimerScreen} />
				<Stack.Screen name="AddEditInterval" component={AddEditIntervalScreen} />
			</Stack.Navigator>
		</NavigationContainer>
	);
}
