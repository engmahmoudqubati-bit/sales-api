require('dotenv').config()
const fs = require('fs')
const Papa = require('papaparse')

const file = fs.readFileSync('D:\\Data Anaysis IBM\\Excels\\1.JAN TO JUN 2024 WITH VAT.csv', 'utf8')
const { data } = Papa.parse(file, { header:true, skipEmptyLines:true })

let sql = 'TRUNCATE TABLE sales RESTART IDENTITY;\n'
const batch = []

data.forEach((r, i) => {
  const escape = v => (v||'').toString().trim().replace(/'/g, "''")
  batch.push(
    `('${escape(r.LOCATION_DESC)}','${escape(r.BARCODE)}','${escape(r.ITM_CODE)}','${escape(r.ITM_DESC)}','${escape(r.SCN_CODE)}','${escape(r.SCN_DESC)}','${escape(r.UNIT_DESC)}',${parseFloat(r.QTY)||0},${parseFloat(r.NET_PRICE)||0},${parseInt(r.MONTH)||0},${parseInt(r.YEAR)||0})`
  )
  if(batch.length === 1000 || i === data.length-1) {
    sql += `INSERT INTO sales (location_desc,barcode,itm_code,itm_desc,scn_code,scn_desc,unit_desc,qty,net_price,month,year) VALUES ${batch.join(',\n')};\n`
    batch.length = 0
  }
})

fs.writeFileSync('import.sql', sql)
console.log('✅ Done! import.sql created — ' + data.length + ' rows')