require('dotenv').config()
const { Pool } = require("pg")
const fs = require("fs")
const path = require("path")
const Papa = require("papaparse")

async function importCSV(filePath) {
  const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 60000,
  idleTimeoutMillis: 60000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  max: 1
})

  try {
    console.log("📂 Reading CSV file...")
    const file = fs.readFileSync(filePath, "utf8")

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        const rows = result.data
        console.log(`✅ Found ${rows.length} rows — starting import...`)

        await pool.query("TRUNCATE TABLE sales RESTART IDENTITY")
console.log("🗑️  Old data cleared")

        const batchSize = 500
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

          let retries = 3
          while(retries > 0) {
            try {
              await pool.query(
                `INSERT INTO sales (location_desc,barcode,itm_code,itm_desc,scn_code,scn_desc,unit_desc,qty,net_price,month,year)
                 VALUES ${placeholders}`,
                values
              )
              break
            } catch(err) {
              retries--
              if(retries === 0) throw err
              console.log(`⚠️  Retrying batch ${i}...`)
              await new Promise(r => setTimeout(r, 2000))
            }
          }

          inserted += batch.length
          if(inserted % 5000 === 0) {
            console.log(`⬆️  Inserted ${inserted}/${rows.length} rows...`)
          }
        }

        console.log(`🎉 Import complete! ${inserted} rows inserted.`)
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