import React, { useState, useEffect } from "react";
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	TextInput,
	StatusBar,
	SafeAreaView,
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker"; // Import Picker

// Define your alarm sound options
// In a real app, these would correspond to actual audio files (e.g., local assets or remote URLs)
const alarmSounds = [
	{ label: "None", value: "none" },
	{ label: "Bell Chime", value: "bell_chime" },
	{ label: "Buzzer", value: "buzzer" },
	{ label: "Ding", value: "ding" },
	{ label: "Ascending Tone", value: "ascending_tone" },
	{ label: "Classic Alarm", value: "classic_alarm" },
	{ label: "Chirp", value: "chirp" },
	{ label: "Whistle", value: "whistle" },
	{ label: "Gong", value: "gong" },
	{ label: "Digital Beep", value: "digital_beep" },
];

export default function AddEditIntervalScreen({ navigation, route }) {
	const routineToEdit = route.params?.routine;

	const [name, setName] = useState(routineToEdit?.name || "");
	const [intervals, setIntervals] = useState(
		routineToEdit?.intervals || [{ id: Date.now().toString(), duration: "", type: "work" }]
	);
	const [sets, setSets] = useState(routineToEdit?.sets?.toString() || "1");
	const [description, setDescription] = useState(routineToEdit?.description || "");
	// New state for selected sound
	const [selectedSound, setSelectedSound] = useState(routineToEdit?.sound || "none");

	const isEditing = !!routineToEdit;

	const handleAddInterval = () => {
		setIntervals((prevIntervals) => [...prevIntervals, { id: Date.now().toString(), duration: "", type: "work" }]);
	};

	const handleRemoveInterval = (id) => {
		if (intervals.length === 1) {
			Alert.alert("Cannot Remove", "A routine must have at least one interval.");
			return;
		}
		setIntervals((prevIntervals) => prevIntervals.filter((interval) => interval.id !== id));
	};

	const handleIntervalDurationChange = (id, newDuration) => {
		setIntervals((prevIntervals) =>
			prevIntervals.map((interval) => (interval.id === id ? { ...interval, duration: newDuration } : interval))
		);
	};

	const handleSaveRoutine = () => {
		if (!name.trim()) {
			Alert.alert("Validation Error", "Routine name cannot be empty.");
			return;
		}

		const parsedSets = parseInt(sets);
		if (isNaN(parsedSets) || parsedSets <= 0) {
			Alert.alert("Validation Error", "Sets must be a positive number.");
			return;
		}

		const validIntervals = [];
		for (const interval of intervals) {
			const parsedDuration = parseInt(interval.duration);
			if (isNaN(parsedDuration) || parsedDuration <= 0) {
				Alert.alert(
					"Validation Error",
					`All interval durations must be positive numbers. Please check "${interval.duration}".`
				);
				return;
			}
			validIntervals.push({ ...interval, duration: parsedDuration });
		}

		const newRoutine = {
			id: isEditing ? routineToEdit.id : Date.now().toString(),
			name: name.trim(),
			intervals: validIntervals,
			sets: parsedSets,
			description: description.trim() || `Custom routine with ${validIntervals.length} segments.`,
			sound: selectedSound, // Include the selected sound
		};

		if (isEditing) {
			Alert.alert("Routine Updated", `${newRoutine.name} has been updated!`);
			navigation.navigate("Home", { updatedRoutine: newRoutine });
		} else {
			Alert.alert("Routine Saved", `${newRoutine.name} has been added!`);
			navigation.navigate("Home", { newRoutine: newRoutine });
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
			<TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
				<MaterialIcons name="arrow-back" size={28} color="#00ff00" />
				<Text style={styles.backButtonText}>Back</Text>
			</TouchableOpacity>

			<Text style={styles.header}>{isEditing ? "Edit Routine" : "Add New Routine"}</Text>

			<KeyboardAvoidingView
				style={styles.formContainer}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 20}
			>
				<ScrollView contentContainerStyle={styles.scrollViewContent}>
					<Text style={styles.label}>Routine Name</Text>
					<TextInput
						style={styles.input}
						placeholder="e.g., HIIT 30/10, Pomodoro Focus"
						placeholderTextColor="#888"
						value={name}
						onChangeText={setName}
					/>

					<Text style={[styles.label, { marginTop: 25 }]}>Intervals</Text>
					{intervals.map((interval, index) => (
						<View key={interval.id} style={styles.intervalInputRow}>
							<Text style={styles.intervalNumber}>{index + 1}.</Text>
							<TextInput
								style={[styles.input, styles.intervalDurationInput]}
								placeholder="Duration (seconds)"
								placeholderTextColor="#888"
								keyboardType="numeric"
								value={interval.duration.toString()}
								onChangeText={(text) => handleIntervalDurationChange(interval.id, text)}
							/>
							{intervals.length > 1 && (
								<TouchableOpacity
									style={styles.removeIntervalButton}
									onPress={() => handleRemoveInterval(interval.id)}
								>
									<MaterialIcons name="remove-circle-outline" size={24} color="#ff0000" />
								</TouchableOpacity>
							)}
						</View>
					))}

					<TouchableOpacity style={styles.addIntervalButton} onPress={handleAddInterval}>
						<MaterialIcons name="add-circle-outline" size={24} color="#00ff00" />
						<Text style={styles.addIntervalButtonText}>Add Interval</Text>
					</TouchableOpacity>

					<Text style={styles.label}>Number of Sets/Rounds</Text>
					<TextInput
						style={styles.input}
						placeholder="e.g., 8, 4"
						placeholderTextColor="#888"
						keyboardType="numeric"
						value={sets}
						onChangeText={setSets}
					/>

					<Text style={styles.label}>Alarm Sound</Text>
					<View style={styles.pickerContainer}>
						<Picker
							selectedValue={selectedSound}
							onValueChange={(itemValue, itemIndex) => setSelectedSound(itemValue)}
							style={styles.picker}
							itemStyle={styles.pickerItem}
						>
							{alarmSounds.map((sound) => (
								<Picker.Item key={sound.value} label={sound.label} value={sound.value} />
							))}
						</Picker>
					</View>

					<Text style={styles.label}>Description (Optional)</Text>
					<TextInput
						style={[styles.input, styles.descriptionInput]}
						placeholder="e.g., Full body workout with jumping jacks and burpees."
						placeholderTextColor="#888"
						multiline
						numberOfLines={3}
						value={description}
						onChangeText={setDescription}
					/>
				</ScrollView>
			</KeyboardAvoidingView>

			<TouchableOpacity style={styles.saveButton} onPress={handleSaveRoutine}>
				<Text style={styles.saveButtonText}>{isEditing ? "Update Routine" : "Save Routine"}</Text>
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
		fontSize: 30,
		fontWeight: "bold",
		color: "#ffffff",
		textAlign: "center",
		marginBottom: 30,
	},
	formContainer: {
		flex: 1,
		width: "100%",
	},
	scrollViewContent: {
		paddingBottom: 20,
	},
	label: {
		fontSize: 16,
		color: "#e0e0e0",
		marginBottom: 8,
		marginTop: 15,
	},
	input: {
		backgroundColor: "#333333",
		color: "#ffffff",
		borderRadius: 10,
		paddingVertical: 12,
		paddingHorizontal: 15,
		fontSize: 18,
		borderWidth: 1,
		borderColor: "#00ff00",
	},
	descriptionInput: {
		height: 100,
		textAlignVertical: "top",
	},
	saveButton: {
		backgroundColor: "#00ff00",
		paddingVertical: 15,
		borderRadius: 10,
		alignItems: "center",
		marginBottom: 20,
		marginTop: 20,
	},
	saveButtonText: {
		color: "#1a1a1a",
		fontSize: 20,
		fontWeight: "bold",
	},
	intervalInputRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
	},
	intervalNumber: {
		fontSize: 18,
		color: "#ffffff",
		marginRight: 10,
		width: 25,
	},
	intervalDurationInput: {
		flex: 1,
		marginRight: 10,
	},
	removeIntervalButton: {
		padding: 5,
	},
	addIntervalButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#333333",
		paddingVertical: 10,
		borderRadius: 10,
		marginTop: 10,
		borderWidth: 1,
		borderColor: "#00ff00",
	},
	addIntervalButtonText: {
		color: "#00ff00",
		fontSize: 16,
		marginLeft: 5,
		fontWeight: "bold",
	},
	pickerContainer: {
		backgroundColor: "#333333",
		borderRadius: 10,
		borderWidth: 1,
		borderColor: "#00ff00",
		marginBottom: 10,
		overflow: "hidden", // Ensures the picker content stays within bounds
	},
	picker: {
		height: 50, // Adjust height as needed
		color: "#ffffff", // Text color for picker items
	},
	pickerItem: {
		color: "#ffffff", // This might not work on all platforms for item text color.
		// Styling picker items can be tricky and platform-dependent.
	},
});