const express = require("express")
const { Pool } = require("pg")
const cors = require("cors")
require("dotenv").config()

const app = express()
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

app.use(cors())
app.use(express.json())

app.get("/api/sales", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM sales ORDER BY year, month, day")
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => console.log(`API running on port ${PORT}`))