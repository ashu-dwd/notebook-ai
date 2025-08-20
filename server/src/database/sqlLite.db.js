import Database from "better-sqlite3";
import ApiError from "../utils/ApiError.js";

console.log("Initializing database...");
export const db = new Database("./notebook-lm.sqlite");
console.log(`Database path: ${db.name}`);
db.pragma("foreign_keys = ON");

// Agar table pehle se nahi hai to ek dummy bana dete hain
// Users Table
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS userData (
    userId     INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    email      TEXT UNIQUE NOT NULL,
    password   TEXT NOT NULL,
    createdAt  DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`
).run();
console.log("Users table created or already exists.");

// Chats Table
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS chats (
    chatId     INTEGER PRIMARY KEY AUTOINCREMENT,
    userId     INTEGER NOT NULL,
    userMsg    TEXT NOT NULL,
    aiResponse TEXT NOT NULL,
    createdAt  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES userData(userId) ON DELETE CASCADE
  )
`
).run();

// Files Table
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS files (
    fileId     INTEGER PRIMARY KEY AUTOINCREMENT,
    userId     INTEGER NOT NULL,
    filePath   TEXT NOT NULL,
    vectorId   TEXT,
    chatId     TEXT,
    uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES userData(userId) ON DELETE CASCADE
  )
`
).run();

/**
 * Generic Query Function
 */
export function runQuery(sql, params = []) {
  try {
    //console.log(`Executing SQL: ${sql}`);
    const stmt = db.prepare(sql);

    // Agar query SELECT hai to all() ya get() use karenge
    if (sql.trim().toLowerCase().startsWith("select")) {
      if (sql.toLowerCase().includes("limit 1")) {
        return stmt.get(params); // single row
      }
      return stmt.all(params); // multiple rows
    }

    // INSERT/UPDATE/DELETE ke liye run()
    //console.log(stmt.run(params));
    return stmt.run(params);
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Database query failed", [error.message]);
  }
}
