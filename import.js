require('dotenv').config()
const { Pool } = require("pg")
const fs = require("fs")
const path = require("path")
const Papa = require("papaparse")

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function importCSV(filePath) {
  try {
    console.log("📂 Reading CSV file...")
    const file = fs.readFileSync(filePath, "utf8")

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        const rows = result.data
        console.log(`✅ Found ${rows.length} rows — starting import...`)

        await pool.query("DELETE FROM sales")
        console.log("🗑️  Old data cleared")

        const batchSize = 1000
        let inserted = 0

        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize)
          const values = []
          const placeholders = batch.map((row, j) => {
            const base = j * 11
            values.push(
              row.LOCATION_DESC?.trim(),
              row.BARCODE?.trim(),
              row.ITM_CODE?.trim(),
              row.ITM_DESC?.trim(),
              row.SCN_CODE?.trim(),
              row.SCN_DESC?.trim(),
              row.UNIT_DESC?.trim(),
              parseFloat(row.QTY) || 0,
              parseFloat(row.NET_PRICE) || 0,
              parseInt(row.MONTH) || 0,
              parseInt(row.YEAR) || 0
            )
            return `($${base+1},$${base+2},$${base+3},$${base+4},$${base+5},$${base+6},$${base+7},$${base+8},$${base+9},$${base+10},$${base+11})`
          }).join(",")

          await pool.query(
            `INSERT INTO sales (location_desc,barcode,itm_code,itm_desc,scn_code,scn_desc,unit_desc,qty,net_price,month,year)
             VALUES ${placeholders}`,
            values
          )

          inserted += batch.length
          console.log(`⬆️  Inserted ${inserted}/${rows.length} rows...`)
        }

        console.log(`🎉 Import complete! ${inserted} rows inserted into PostgreSQL.`)
        await pool.end()
      }
    })
  } catch (err) {
    console.error("❌ Error:", err.message)
    await pool.end()
  }
}

const filePath = process.argv[2]
if (!filePath) {
  console.error("❌ Please provide CSV file path")
  process.exit(1)
}

importCSV(path.resolve(filePath))