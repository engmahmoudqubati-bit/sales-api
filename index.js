require("dotenv").config()
const express = require("express")
const { Pool } = require("pg")
const cors = require("cors")

const app = express()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

app.use(cors())
app.use(express.json())

app.get("/api/sales", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM sales ORDER BY year, month, day")
    res.json(rows)
  } catch (err) {
    console.error("DB Error:", err.message)
    res.status(500).json({ error: err.message })
  }
})

app.get("/", (req, res) => {
  res.json({ status: "API is running!" })
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => console.log(`API running on port ${PORT}`))