const express = require("express")
const { Pool } = require("pg")
const cors = require("cors")

const app = express()

console.log("Starting API...")
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Found" : "NOT FOUND")

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

pool.connect((err, client, release) => {
  if (err) console.error("Database connection error:", err.message)
  else { console.log("Database connected successfully!"); release() }
})

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.json({ status: "ok" })
})

app.get("/api/sales", async (req, res) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit) || 10000, 100000)
    const offset = parseInt(req.query.offset) || 0

    const { rows } = await pool.query(
      "SELECT * FROM sales ORDER BY year, month LIMIT $1 OFFSET $2",
      [limit, offset]
    )
    res.json(rows)
  } catch (err) {
    console.error("Query error:", err.message)
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 8080
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Running on ${PORT}`)
})

process.on("uncaughtException", (err) => {
  console.error("Uncaught:", err.message)
})