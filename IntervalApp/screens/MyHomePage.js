import React, { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	FlatList,
	StatusBar,
	SafeAreaView,
	Alert,
	ImageBackground,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { getRoutines, deleteRoutine } from "../DB/db"; 

export default function MyHomePage({ navigation, route }) {
	const [intervals, setIntervals] = useState([]); 
	const [quickStartRoutine, setQuickStartRoutine] = useState(null); 

	const loadRoutines = useCallback(async () => {
		try {
			const fetchedRoutines = await getRoutines();
			setIntervals(fetchedRoutines);

			const lastId = await AsyncStorage.getItem("lastStartedRoutineId");
			if (lastId) {
				const lastRoutine = fetchedRoutines.find((r) => r.id === lastId);
				if (lastRoutine) {
					setQuickStartRoutine(lastRoutine);
				} else if (fetchedRoutines.length > 0) {
					setQuickStartRoutine(fetchedRoutines[0]);
				} else {
					setQuickStartRoutine(null);
				}
			} else if (fetchedRoutines.length > 0) {
				setQuickStartRoutine(fetchedRoutines[0]);
			} else {
				setQuickStartRoutine(null);
			}
		} catch (error) {
			console.error("Error loading routines:", error);
			Alert.alert("Error", "Failed to load routines from database.");
		}
	}, []);


	useEffect(() => {
		loadRoutines();
		const unsubscribe = navigation.addListener("focus", loadRoutines);
		return unsubscribe;
	}, [navigation, loadRoutines]);




	const handleStartRoutine = async (routine) => {
		try {
			await AsyncStorage.setItem("lastStartedRoutineId", routine.id);
		} catch (err) {
			console.warn("Failed to save last started routine", err);
		}
		navigation.navigate("Timer", { routine });
	};

	const handleAddInterval = () => {
		
		navigation.navigate("AddEditInterval", { onSave: loadRoutines });
	};

	const handleEditInterval = (routine) => {
		
		navigation.navigate("AddEditInterval", { routine: routine, onSave: loadRoutines });
	};


	const handleRemoveRoutine = (id) => {
		Alert.alert(
			"Delete Routine",
			"Are you sure you want to delete this routine?",
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Delete",
					onPress: async () => {
						try {
							await deleteRoutine(id);
							loadRoutines(); 
							Alert.alert("Deleted", "Routine removed successfully.");
						} catch (error) {
							console.error("Error deleting routine:", error);
							Alert.alert("Error", "Failed to delete routine.");
						}
					},
					style: "destructive",
				},
			],
			{ cancelable: true }
		);
	};


	const formatDuration = (seconds) => {
		if (seconds < 60) return `${seconds}s`;
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}m${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ""}`.trim();
	};

	const renderIntervalItem = ({ item }) => (
		<View style={styles.intervalCard}>
			<View style={styles.cardHeader}>
				<Text style={styles.cardTitle}>{item.name}</Text>
				<View style={styles.cardActions}>
					<TouchableOpacity onPress={() => handleEditInterval(item)} style={styles.actionButton}>
						<MaterialIcons name="edit" size={24} color="#00ff00" />
					</TouchableOpacity>
					<TouchableOpacity onPress={() => handleRemoveRoutine(item.id)} style={styles.actionButton}>
						<MaterialIcons name="delete" size={24} color="#ff0000" />
					</TouchableOpacity>
				</View>
			</View>
			<Text style={styles.cardDescription}>{item.description}</Text>
			<View style={styles.detailsRow}>
				{item.intervals && item.intervals.length > 0 && (
					<Text style={styles.detailText}>
						Segments:{" "}
						{item.intervals
							.map((segment) => `${formatDuration(segment.duration)} (${segment.type})`)
							.join(", ")}
					</Text>
				)}
				<Text style={styles.detailText}>Sets: {item.sets}</Text>
			</View>
			<TouchableOpacity style={styles.startButton} onPress={() => handleStartRoutine(item)}>
				<Text style={styles.startButtonText}>Start</Text>
			</TouchableOpacity>
		</View>
	);

	return (
		<ImageBackground source={require("../assets/BAck.jpg")} style={styles.background}>
			<SafeAreaView style={styles.container}>
				<StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
				<Text style={styles.header}>Interval App</Text>

				
				{quickStartRoutine && (
					<View style={styles.quickStartCard}>
						<Text style={styles.quickStartLabel}>Quick Start:</Text>
						<Text style={styles.quickStartTitle}>{quickStartRoutine.name}</Text>
						<TouchableOpacity
							style={styles.quickStartButton}
							onPress={() => handleStartRoutine(quickStartRoutine)}
						>
							<MaterialIcons name="play-arrow" size={28} color="#1a1a1a" />
							<Text style={styles.quickStartButtonText}>Start Last</Text>
						</TouchableOpacity>
					</View>
				)}

				<Text style={styles.sectionTitle}>Your Routines</Text>
				<FlatList
					data={intervals}
					renderItem={renderIntervalItem}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.intervalsList}
				
					ListEmptyComponent={<Text style={styles.emptyListText}>No routines yet. Tap '+' to add one!</Text>}
				/>

				<TouchableOpacity style={styles.addButton} onPress={handleAddInterval}>
					<MaterialIcons name="add" size={30} color="#1a1a1a" />
				</TouchableOpacity>
			</SafeAreaView>
		</ImageBackground>
	);
}

const styles = StyleSheet.create({
	background: {
		flex: 1,
		resizeMode: "cover",
		justifyContent: "center",
	},
	container: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)", 
		paddingHorizontal: 15,
	},
	header: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#00ff00",
		textAlign: "center",
		marginTop: 40, 
		marginBottom: 25,
	},
	quickStartCard: {
		backgroundColor: "rgba(51, 51, 51, 0.7)",
		borderRadius: 15,
		padding: 20,
		marginBottom: 20,
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "space-between",
		borderWidth: 1,
		borderColor: "#00ff00",
	},
	quickStartLabel: {
		fontSize: 16,
		color: "#aaaaaa",
	},
	quickStartTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#ffffff",
		flex: 1,
		marginLeft: 10,
	},
	quickStartButton: {
		backgroundColor: "#00ff00",
		paddingVertical: 8,
		paddingHorizontal: 15,
		borderRadius: 10,
		flexDirection: "row",
		alignItems: "center",
	},
	quickStartButtonText: {
		color: "#1a1a1a",
		fontSize: 18,
		fontWeight: "bold",
		marginLeft: 5,
	},
	sectionTitle: {
		fontSize: 22,
		fontWeight: "bold",
		color: "#ffffff",
		marginBottom: 15,
	},
	intervalsList: {
		paddingBottom: 80,
	},
	intervalCard: {
		backgroundColor: "rgba(51, 51, 51, 0.7)",
		borderRadius: 15,
		padding: 20,
		marginBottom: 15,
		borderWidth: 1,
		borderColor: "#00ff00",
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 10,
	},
	cardTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#ffffff",
		flex: 1,
		marginRight: 10,
	},
	cardActions: {
		flexDirection: "row",
		alignItems: "center",
	},
	actionButton: {
		marginLeft: 10,
		padding: 5,
	},
	cardDescription: {
		fontSize: 14,
		color: "#aaaaaa",
		marginBottom: 10,
	},
	detailsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 15,
	},
	detailText: {
		fontSize: 14,
		color: "#e0e0e0",
	},
	startButton: {
		backgroundColor: "#00ff00",
		paddingVertical: 12,
		borderRadius: 10,
		alignItems: "center",
	},
	startButtonText: {
		color: "#1a1a1a",
		fontSize: 20,
		fontWeight: "bold",
	},
	addButton: {
		position: "absolute",
		bottom: 30,
		right: 30,
		backgroundColor: "#00ff00",
		width: 60,
		height: 60,
		borderRadius: 30,
		alignItems: "center",
		justifyContent: "center",
		elevation: 5,
		shadowColor: "#00ff00",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.8,
		shadowRadius: 3,
	},
	emptyListText: {
		color: "#aaaaaa",
		fontSize: 16,
		textAlign: "center",
		marginTop: 50,
	},
});
