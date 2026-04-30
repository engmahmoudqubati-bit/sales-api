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
const limit = Math.min(parseInt(req.query.limit) || 10000, 100000)    const offset = parseInt(req.query.offset) || 0
    const month  = req.query.month
    const branch = req.query.branch

    let query  = "SELECT * FROM sales WHERE 1=1"
    let params = []
    let idx    = 1

    if(month && month !== "All") {
      query += ` AND month = $${idx++}`
      params.push(parseInt(month))
    }
    if(branch && branch !== "All") {
      query += ` AND location_desc = $${idx++}`
      params.push(branch)
    }

    query += ` ORDER BY year, month LIMIT $${idx++} OFFSET $${idx++}`
    params.push(limit, offset)

    const { rows } = await pool.query(query, params)
    res.json(rows)
  } catch (err) {
    console.error("Query error:", err.message)
    res.status(500).json({ error: err.message })
  }
})

const PORT = parseInt(process.env.PORT) || 8080
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on 0.0.0.0:${PORT}`)
})