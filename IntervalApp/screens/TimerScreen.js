import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, StatusBar, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";

const alarmSounds = [
	{ label: "None", value: "none" },
	{ label: "Alert Sound", value: "alert-sound-87478.mp3" },
	{ label: "Chime Alert", value: "chime-alert-demo-309545.mp3" },
	{ label: "Estonia EAS Alarm", value: "estonia-eas-alarm-1984-sad-249124.mp3" },
	{ label: "Extraterrestrial Alert", value: "extraterrestrial-alert-sound-287337.mp3" },
	{ label: "Japan EAS Alarm", value: "japan-eas-alarm-277877.mp3" },
	{ label: "Lofi Alarm Clock", value: "lofi-alarm-clock-243766.mp3" },
	{ label: "Notification 9", value: "notification-9-158194.mp3" },
	{ label: "Notification Ping", value: "notification-ping-335500.mp3" },
	{ label: "Percu", value: "percu-194207.mp3" },
	{ label: "Thailand EAS Alarm", value: "thailand-eas-alarm-2006-266492.mp3" },
	{ label: "Tonal Fountain", value: "tonal-fountain-sound-effect-241390.mp3" },
]; 

const soundMap = {
	none: null,
	"alert-sound-87478.mp3": require("../assets/Audio/alert-sound-87478.mp3"),
	"chime-alert-demo-309545.mp3": require("../assets/Audio/chime-alert-demo-309545.mp3"),
	"estonia-eas-alarm-1984-sad-249124.mp3": require("../assets/Audio/estonia-eas-alarm-1984-sad-249124.mp3"),
	"extraterrestrial-alert-sound-287337.mp3": require("../assets/Audio/extraterrestrial-alert-sound-287337.mp3"),
	"japan-eas-alarm-277877.mp3": require("../assets/Audio/japan-eas-alarm-277877.mp3"),
	"lofi-alarm-clock-243766.mp3": require("../assets/Audio/lofi-alarm-clock-243766.mp3"),
	"notification-9-158194.mp3": require("../assets/Audio/notification-9-158194.mp3"),
	"notification-ping-335500.mp3": require("../assets/Audio/notification-ping-335500.mp3"),
	"percu-194207.mp3": require("../assets/Audio/percu-194207.mp3"),
	"thailand-eas-alarm-2006-266492.mp3": require("../assets/Audio/thailand-eas-alarm-2006-266492.mp3"),
	"tonal-fountain-sound-effect-241390.mp3": require("../assets/Audio/tonal-fountain-sound-effect-241390.mp3"),
}; //

export default function TimerScreen({ navigation, route }) {
	const { routine } = route.params || {};

	const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
	const [currentSet, setCurrentSet] = useState(1);
	const [timeLeft, setTimeLeft] = useState(0);
	const [isRunning, setIsRunning] = useState(false);

	const soundObjectRef = useRef(new Audio.Sound());

	const playSound = async (soundKey) => {
		const soundSource = soundMap[soundKey];
		if (!soundSource) {
			console.log("No sound selected or sound file not found for:", soundKey);
			return;
		}

		try {
			await soundObjectRef.current.unloadAsync();
			await soundObjectRef.current.loadAsync(soundSource);
			await soundObjectRef.current.playAsync();
			console.log("Playing sound:", soundKey);
		} catch (error) {
			console.error("Error playing sound:", error);
		}
	};

	useEffect(() => {
		if (routine && routine.intervals && routine.intervals.length > 0) {
			setTimeLeft(routine.intervals[0].duration);
		}

		return () => {
			if (soundObjectRef.current) {
				soundObjectRef.current.unloadAsync();
			}
		};
	}, [routine]);

	useEffect(() => {
		let timerInterval;

		if (isRunning && timeLeft > 0) {
			timerInterval = setInterval(() => {
				setTimeLeft((prevTime) => prevTime - 1);
			}, 1000);
		} else if (timeLeft === 0 && isRunning) {
			playSound(routine?.sound); 

			if (currentSegmentIndex < routine.intervals.length - 1) {
				setCurrentSegmentIndex((prevIndex) => prevIndex + 1);
				setTimeLeft(routine.intervals[currentSegmentIndex + 1].duration);
			} else if (currentSet < routine.sets) {
				setCurrentSet((prevSet) => prevSet + 1);
				setCurrentSegmentIndex(0); 
				setTimeLeft(routine.intervals[0].duration);
			} else {
				
				setIsRunning(false);
				Alert.alert("Routine Complete!", `${routine.name} finished all sets.`);
			}
		}

		return () => clearInterval(timerInterval); 
	}, [timeLeft, isRunning, currentSegmentIndex, currentSet, routine]);

	const formatDuration = (seconds) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
		const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;
		return `${formattedMinutes}:${formattedSeconds}`;
	};

	const currentInterval = routine?.intervals[currentSegmentIndex];
	const cueText = currentInterval?.type === "work" ? "Work!" : "Rest!";

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
								Phase: {currentInterval?.type === "work" ? "Work" : "Rest"} (
								{formatDuration(currentInterval?.duration || 0)})
							</Text>
							
							<Text style={styles.routineDetails}>
								Alarm:{" "}
								{routine.sound
									? alarmSounds.find((s) => s.value === routine.sound)?.label || "Custom Sound"
									: "None"}
							</Text>
						</View>
					)}
				</View>
			) : (
				<Text style={styles.noRoutineText}>No routine selected.</Text>
			)}

			<View style={styles.timerPlaceholder}>
				<Text style={styles.timerText}>{formatDuration(timeLeft)}</Text>
				<Text style={styles.cueText}>{cueText}</Text>
			</View>

			<View style={styles.controlsPlaceholder}>
				<TouchableOpacity style={styles.controlButton} onPress={() => setIsRunning(!isRunning)}>
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
