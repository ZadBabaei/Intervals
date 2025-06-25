import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, StatusBar, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Audio } from "expo-av"; // ✅ Using expo-av
import * as KeepAwake from "expo-keep-awake";
import styles from "./TimerScreenStyle";

export default function TimerScreen({ navigation, route }) {
	const { routine } = route.params || {};

	const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
	const [currentSet, setCurrentSet] = useState(1);
	const [timer, setTimer] = useState(0);
	const [timerRunning, setTimerRunning] = useState(false);
	const [currentPhase, setCurrentPhase] = useState("");
	const prevPhaseRef = useRef(null);
	const soundObjectRef = useRef(new Audio.Sound());
	const intervalRef = useRef(null);

	const playSound = async (soundName) => {
		console.log("Trying to play sound:", soundName);

		try {
			if (!soundName || soundName === "none") return;

			const fileName = soundName.trim().split("/").pop();

			const soundMap = {
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
			};

			const soundUri = soundMap[fileName];
			if (!soundUri) {
				console.warn("Unknown sound:", fileName);
				return;
			}

			try {
				await soundObjectRef.current.unloadAsync();
			} catch (_) {}

			await soundObjectRef.current.loadAsync(soundUri);
			await soundObjectRef.current.playAsync();

			setTimeout(async () => {
				try {
					await soundObjectRef.current.stopAsync();
				} catch (e) {}
			}, 1000);
		} catch (error) {
			console.error("Error playing sound:", error);
			Alert.alert("Sound Error", "Could not play sound.");
		}
	};

	const startNextPhase = (nextIndex, nextSet) => {
		const intervals = routine.intervals;
		if (nextIndex < intervals.length) {
			const nextType = intervals[nextIndex].type;
			setCurrentIntervalIndex(nextIndex);
			setCurrentPhase(nextType === "work" ? "Work" : "Rest");
			setTimer(intervals[nextIndex].duration);
		} else if (currentSet < routine.sets) {
			setCurrentSet(currentSet + 1);
			setCurrentIntervalIndex(0);
			setCurrentPhase(routine.intervals[0].type === "work" ? "Work" : "Rest");
			setTimer(routine.intervals[0].duration);
		} else {
			setCurrentPhase("Finished");
			setTimer(0);
			setTimerRunning(false);
			KeepAwake.deactivateKeepAwake();
		}
	};

	useEffect(() => {
		if (timerRunning && timer > 0) {
			intervalRef.current = setInterval(() => {
				setTimer((prevTimer) => prevTimer - 1);
			}, 1000);
		} else if (timerRunning && timer === 0) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
			if (currentPhase === "Work" || currentPhase === "Rest") {
				startNextPhase(currentIntervalIndex + 1, currentSet);
			} else if (currentPhase === "Break") {
				startNextPhase(0, currentSet + 1);
			} else if (currentPhase === "Finished") {
				setTimerRunning(false);
				KeepAwake.deactivateKeepAwake();
			}
		}

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [timer, timerRunning]);

	useEffect(() => {
		if (currentPhase && prevPhaseRef.current !== currentPhase) {
			if (currentPhase === "Work" || currentPhase === "Rest" || currentPhase === "Break") {
				playSound(routine.sound);
			}
			if (currentPhase === "Finished") {
				playSound("chime-alert-demo-309545.mp3");
				KeepAwake.deactivateKeepAwake();
			}
			prevPhaseRef.current = currentPhase;
		}
	}, [currentPhase]);

	useEffect(() => {
		if (routine && routine.intervals && routine.intervals.length > 0) {
			setCurrentIntervalIndex(0);
			setCurrentSet(1);
			setCurrentPhase(routine.intervals[0].type === "work" ? "Work" : "Rest");
			setTimer(routine.intervals[0].duration);
		}
	}, [routine]);

	const toggleTimer = async () => {
		if (timerRunning) {
			setTimerRunning(false);
			KeepAwake.deactivateKeepAwake();
		} else {
			if (currentPhase === "Finished" || !routine) {
				if (routine && routine.intervals && routine.intervals.length > 0) {
					setCurrentIntervalIndex(0);
					setCurrentSet(1);
					setCurrentPhase(routine.intervals[0].type === "work" ? "Work" : "Rest");
					setTimer(routine.intervals[0].duration);
				}
			}
			setTimerRunning(true);
			KeepAwake.activateKeepAwake();
		}
	};

	const resetTimer = () => {
		clearInterval(intervalRef.current);
		intervalRef.current = null;
		setTimerRunning(false);
		if (routine && routine.intervals && routine.intervals.length > 0) {
			setCurrentIntervalIndex(0);
			setCurrentSet(1);
			setCurrentPhase(routine.intervals[0].type === "work" ? "Work" : "Rest");
			setTimer(routine.intervals[0].duration);
		} else {
			setCurrentPhase("");
			setTimer(0);
		}
		KeepAwake.deactivateKeepAwake();
	};

	const formatTime = (seconds) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
	};

	const displayRoutineInfo = () => {
		if (!routine) return <Text style={styles.noRoutineText}>No routine selected.</Text>;
		if (currentPhase === "Finished") return <Text style={styles.routineName}>Routine Completed!</Text>;
		if (currentPhase === "No Routine Loaded")
			return <Text style={styles.noRoutineText}>No intervals in this routine.</Text>;
		if (currentPhase === "Break") {
			return (
				<>
					<Text style={styles.routineName}>Break Time</Text>
					<Text style={styles.routineDetails}>Next: Set {currentSet + 1}</Text>
				</>
			);
		}
		const currentInterval = routine.intervals[currentIntervalIndex];
		if (!currentInterval) return <Text style={styles.routineName}>Loading next interval...</Text>;

		return (
			<>
				<Text style={styles.routineName}>{routine.name}</Text>
				<Text style={styles.routineDetails}>
					Phase: {currentPhase} ({currentInterval.type})
				</Text>
				<Text style={styles.routineDetails}>
					Set: {currentSet} / {routine.sets}
				</Text>
				<Text style={styles.routineDetails}>
					Interval: {currentIntervalIndex + 1} / {routine.intervals.length}
				</Text>
				<Text style={styles.routineDetails}>Description: {routine.description}</Text>
			</>
		);
	};

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
			<TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
				<MaterialIcons name="arrow-back" size={28} color="#00ff00" />
				<Text style={styles.backButtonText}>Back</Text>
			</TouchableOpacity>

			<Text style={styles.header}>Timer</Text>
			<View style={styles.routineInfo}>{displayRoutineInfo()}</View>

			<View style={styles.timerPlaceholder}>
				<Text style={styles.timerText}>{formatTime(timer)}</Text>
				<Text style={styles.currentPhaseText}>{currentPhase}</Text>
			</View>

			<View style={styles.controls}>
				<TouchableOpacity style={styles.controlButton} onPress={toggleTimer}>
					<MaterialIcons name={timerRunning ? "pause" : "play-arrow"} size={48} color="#1a1a1a" />
					<Text style={styles.controlButtonText}>{timerRunning ? "Pause" : "Start"}</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.controlButton} onPress={resetTimer}>
					<MaterialIcons name="replay" size={48} color="#1a1a1a" />
					<Text style={styles.controlButtonText}>Reset</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}
