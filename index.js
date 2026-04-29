const express = require("express")
const { Pool } = require("pg")
const cors = require("cors")

const app = express()

console.log("Starting API...")
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Found" : "NOT FOUND")

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
})

// Test database connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error("Database connection error:", err.message)
  } else {
    console.log("Database connected successfully!")
    release()
  }
})

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.json({ status: "API is running!" })
})

app.get("/api/sales", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM sales ORDER BY year, month, day")
    res.json(rows)
  } catch (err) {
    console.error("Query error:", err.message)
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => console.log(`API running on port ${PORT}`))