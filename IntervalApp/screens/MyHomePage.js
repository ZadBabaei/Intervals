import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, FlatList, StatusBar, SafeAreaView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const initialIntervals = [
	{
		id: "1",
		name: "Standard HIIT",
		intervals: [
			{ id: "1a", duration: 30, type: "work" },
			{ id: "1b", duration: 10, type: "work" },
		],
		sets: 8,
		description: "High intensity interval training with 30s work, 10s rest, repeated 8 times.",
	},
	{
		id: "2",
		name: "Pomodoro Focus",
		intervals: [
			{ id: "2a", duration: 25 * 60, type: "work" },
			{ id: "2b", duration: 5 * 60, type: "work" },
		],
		sets: 4,
		description: "25 min focus, 5 min break, 4 cycles.",
	},
	{
		id: "3",
		name: "Custom Stretch Sequence",
		intervals: [
			{ id: "3a", duration: 60, type: "work" },
			{ id: "3b", duration: 45, type: "work" },
			{ id: "3c", duration: 30, type: "work" },
		],
		sets: 1,
		description: "60s, 45s, 30s stretches.",
	},
];

export default function MyHomePage({ navigation, route }) {
	const [intervals, setIntervals] = useState(initialIntervals);
	const [quickStartRoutine, setQuickStartRoutine] = useState(initialIntervals[0]);

	useEffect(() => {
		if (route.params?.newRoutine) {
			setIntervals((prevIntervals) => {
				const updated = [...prevIntervals, route.params.newRoutine];
				return updated;
			});
			navigation.setParams({ newRoutine: undefined });
		} else if (route.params?.updatedRoutine) {
			setIntervals((prevIntervals) =>
				prevIntervals.map((routine) =>
					routine.id === route.params.updatedRoutine.id ? routine.isUpdated : routine
				)
			);
			navigation.setParams({ updatedRoutine: undefined });
		}
	}, [route.params?.newRoutine, route.params?.updatedRoutine, navigation]);

	const handleStartRoutine = (routine) => {
		navigation.navigate("Timer", { routine: routine });
	};

	const handleAddInterval = () => {
		navigation.navigate("AddEditInterval");
	};

	const handleEditInterval = (routine) => {
		navigation.navigate("AddEditInterval", { routine: routine });
	};

	const formatDuration = (seconds) => {
		if (seconds < 60) return `${seconds}s`;
		return `${Math.floor(seconds / 60)}m ${seconds % 60 > 0 ? `${seconds % 60}s` : ""}`.trim();
	};

	const renderIntervalItem = ({ item }) => (
		<View style={styles.intervalCard}>
			<View style={styles.cardHeader}>
				<Text style={styles.cardTitle}>{item.name}</Text>
				<TouchableOpacity onPress={() => handleEditInterval(item)}>
					<MaterialIcons name="edit" size={20} color="#00ff00" />
				</TouchableOpacity>
			</View>
			<Text style={styles.cardDescription}>{item.description}</Text>
			<View style={styles.detailsRow}>
				{item.intervals && item.intervals.length > 0 && (
					<Text style={styles.detailText}>
						Segments: {item.intervals.map((segment) => formatDuration(segment.duration)).join(", ")}
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
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
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
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#1a1a1a",
		paddingHorizontal: 15,
	},
	header: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#00ff00",
		textAlign: "center",
		marginTop: 20,
		marginBottom: 25,
	},
	quickStartCard: {
		backgroundColor: "#333333",
		borderRadius: 15,
		padding: 20,
		marginBottom: 20,
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "space-between",
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
		backgroundColor: "#333333",
		borderRadius: 15,
		padding: 20,
		marginBottom: 15,
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
