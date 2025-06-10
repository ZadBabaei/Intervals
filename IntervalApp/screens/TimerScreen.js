import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, StatusBar, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function TimerScreen({ navigation, route }) {
	const { routine } = route.params || {};

	const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
	const [currentSet, setCurrentSet] = useState(1);
	const [timeLeft, setTimeLeft] = useState(0);
	const [isRunning, setIsRunning] = useState(false);

	useEffect(() => {
		if (routine && routine.intervals && routine.intervals.length > 0) {
			setTimeLeft(routine.intervals[0].duration);
		}
	}, [routine]);

	const formatDuration = (seconds) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
		const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;
		return `${formattedMinutes}:${formattedSeconds}`;
	};

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
			<TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
				<MaterialIcons name="arrow-back" size={28} color="#00ff00" />
				<Text style={styles.backButtonText}>Back</Text>
			</TouchableOpacity>

			<Text style={styles.header}>Timer</Text>
			{routine ? (
				<View style={styles.routineInfo}>
					<Text style={styles.routineName}>{routine.name}</Text>
					<Text style={styles.routineDetails}>
						Sets: {currentSet} / {routine.sets}
					</Text>
					{routine.intervals && routine.intervals.length > 0 && (
						<View style={styles.intervalsSummary}>
							<Text style={styles.routineDetails}>
								Current Segment: {currentSegmentIndex + 1} of {routine.intervals.length}
							</Text>
							<Text style={styles.routineDetails}>
								Phase: {formatDuration(routine.intervals[currentSegmentIndex]?.duration || 0)}
							</Text>
						</View>
					)}
				</View>
			) : (
				<Text style={styles.noRoutineText}>No routine selected.</Text>
			)}

			<View style={styles.timerPlaceholder}>
				<Text style={styles.timerText}>{formatDuration(timeLeft)}</Text>
				<Text style={styles.cueText}>
					{routine?.intervals[currentSegmentIndex]?.type === "work" ? "Work!" : "Rest!"}
				</Text>
			</View>

			<View style={styles.controlsPlaceholder}>
				<TouchableOpacity
					style={styles.controlButton}
					onPress={() => {
						setIsRunning(!isRunning);
						Alert.alert("Action", isRunning ? "Pausing Timer" : "Starting Timer");
					}}
				>
					<Text style={styles.controlButtonText}>{isRunning ? "Pause" : "Start"}</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.controlButton}
					onPress={() => {
						if (routine && routine.intervals && routine.intervals.length > 0) {
							setCurrentSegmentIndex(0);
							setCurrentSet(1);
							setTimeLeft(routine.intervals[0].duration);
							setIsRunning(false);
						}
						Alert.alert("Action", "Timer Reset");
					}}
				>
					<Text style={styles.controlButtonText}>Reset</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#1a1a1a",
		paddingHorizontal: 15,
		alignItems: "center",
	},
	backButton: {
		flexDirection: "row",
		alignSelf: "flex-start",
		marginTop: 20,
		marginBottom: 10,
		alignItems: "center",
	},
	backButtonText: {
		color: "#00ff00",
		fontSize: 18,
		marginLeft: 5,
	},
	header: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#ffffff",
		marginBottom: 30,
	},
	routineInfo: {
		backgroundColor: "#333333",
		borderRadius: 15,
		padding: 20,
		width: "90%",
		marginBottom: 40,
		alignItems: "center",
	},
	routineName: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#00ff00",
		marginBottom: 10,
	},
	routineDetails: {
		fontSize: 16,
		color: "#e0e0e0",
		marginBottom: 5,
	},
	intervalsSummary: {
		marginTop: 10,
		borderTopWidth: 1,
		borderTopColor: "#555",
		paddingTop: 10,
		width: "100%",
		alignItems: "center",
	},
	noRoutineText: {
		fontSize: 18,
		color: "#aaaaaa",
		marginBottom: 50,
	},
	timerPlaceholder: {
		backgroundColor: "#333333",
		borderRadius: 150,
		width: 250,
		height: 250,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 50,
		borderWidth: 5,
		borderColor: "#00ff00",
	},
	timerText: {
		fontSize: 60,
		fontWeight: "bold",
		color: "#ffffff",
	},
	cueText: {
		fontSize: 24,
		color: "#00ff00",
		marginTop: 10,
	},
	controlsPlaceholder: {
		flexDirection: "row",
		justifyContent: "space-around",
		width: "80%",
	},
	controlButton: {
		backgroundColor: "#00ff00",
		paddingVertical: 15,
		paddingHorizontal: 30,
		borderRadius: 10,
	},
	controlButtonText: {
		color: "#1a1a1a",
		fontSize: 20,
		fontWeight: "bold",
	},
});
