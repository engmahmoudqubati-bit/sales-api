const express = require("express")
const { Pool } = require("pg")
const cors = require("cors")

const app = express()
app.use(cors())
app.use(express.json())

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

app.get("/", (req, res) => {
  res.json({ status: "ok" })
})

app.get("/api/sales", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM sales")
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

process.on("uncaughtException", (err) => {
  console.error("Uncaught:", err.message)
})

const PORT = process.env.PORT || 8080
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Running on ${PORT}`)
})