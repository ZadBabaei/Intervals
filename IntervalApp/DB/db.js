
import * as SQLite from "expo-sqlite";

let database = null; 

export const getDb = () => {
	if (!database) {
		database = SQLite.openDatabaseSync("routines.db");
	}
	return database;
};

export const initDatabase = () => {
	return new Promise((resolve, reject) => {
		const db = getDb(); 
		try {

			db.execAsync(
				`PRAGMA journal_mode = WAL;
                CREATE TABLE IF NOT EXISTS routines (
                    id TEXT PRIMARY KEY NOT NULL,
                    name TEXT NOT NULL,
                    intervals TEXT NOT NULL, -- Stored as JSON string
                    sets INTEGER NOT NULL,
                    description TEXT,
                    sound TEXT
                );`
			)
				.then(() => {
					console.log("Routines table created successfully or already exists.");
					resolve();
				})
				.catch((error) => {
					console.error("Error creating routines table:", error);
					reject(error);
				});
		} catch (error) {
			console.error("Failed to initialize database (sync error):", error);
			reject(error);
		}
	});
};

export const addRoutine = (routine) => {
	return new Promise((resolve, reject) => {
		const db = getDb(); 
		try {
			db.runSync(
				`INSERT INTO routines (id, name, intervals, sets, description, sound) VALUES (?, ?, ?, ?, ?, ?);`,
				[
					routine.id,
					routine.name,
					JSON.stringify(routine.intervals),
					routine.sets,
					routine.description,
					routine.sound,
				]
			);
			console.log("Routine added:", routine.name);
			resolve({ rowsAffected: 1 }); 
		} catch (error) {
			console.error("Error adding routine:", error);
			reject(error);
		}
	});
};

export const getRoutines = () => {
	return new Promise((resolve, reject) => {
		const db = getDb(); 
		try {
			const allRows = db.getAllSync(`SELECT * FROM routines;`);
			const routines = allRows.map((row) => ({
				...row,
				intervals: JSON.parse(row.intervals),
			}));
			console.log("Routines fetched:", routines.length);
			resolve(routines);
		} catch (error) {
			console.error("Error getting routines:", error);
			reject(error);
		}
	});
};

export const updateRoutine = (routine) => {
	return new Promise((resolve, reject) => {
		const db = getDb(); 
		try {
			db.runSync(
				`UPDATE routines SET name = ?, intervals = ?, sets = ?, description = ?, sound = ? WHERE id = ?;`,
				[
					routine.name,
					JSON.stringify(routine.intervals),
					routine.sets,
					routine.description,
					routine.sound,
					routine.id,
				]
			);
			console.log("Routine updated:", routine.name);
			resolve({ rowsAffected: 1 }); 
		} catch (error) {
			console.error("Error updating routine:", error);
			reject(error);
		}
	});
};

export const deleteRoutine = (id) => {
	return new Promise((resolve, reject) => {
		const db = getDb(); 
		try {
			db.runSync(`DELETE FROM routines WHERE id = ?;`, [id]);
			console.log("Routine deleted:", id);
			resolve({ rowsAffected: 1 }); 
		} catch (error) {
			console.error("Error deleting routine:", error);
			reject(error);
		}
	});
};
