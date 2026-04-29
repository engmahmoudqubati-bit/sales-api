const express = require("express")
const { Pool } = require("pg")
const cors = require("cors")

const app = express()

app.use(cors({ origin: "*" }))
app.use(express.json())

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

app.get("/", (req, res) => {
  res.status(200).json({ status: "ok" })
})

app.get("/api/sales", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM sales")
    return res.status(200).json(rows)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

const PORT = parseInt(process.env.PORT) || 8080
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on 0.0.0.0:${PORT}`)
})