import * as XLSX from 'xlsx'

/**
 * parseExcelFile — อ่านไฟล์ Excel แล้วแปลงเป็น format เดียวกับ useSheets
 * รองรับทั้ง .xlsx และ .xls
 */
export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array' })
        const result = {}

        workbook.SheetNames.forEach(name => {
          const ws = workbook.Sheets[name]
          result[name] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
        })

        // Try to auto-detect Sales and Targets sheets
        const salesSheet = findSheet(workbook.SheetNames, ['sales','ยอดขาย','sale'])
        const targetsSheet = findSheet(workbook.SheetNames, ['target','เป้า','targets','เป้าหมาย'])

        const salesData = salesSheet ? parseSalesSheet(result[salesSheet]) : null
        const targetsData = targetsSheet ? parseTargetsSheet(result[targetsSheet]) : null

        resolve({
          raw: result,
          sheetNames: workbook.SheetNames,
          sales: salesData,
          targets: targetsData,
          source: 'excel',
          fileName: file.name
        })
      } catch (err) {
        reject(new Error('ไม่สามารถอ่านไฟล์: ' + err.message))
      }
    }

    reader.onerror = () => reject(new Error('อ่านไฟล์ไม่ได้'))
    reader.readAsArrayBuffer(file)
  })
}

function findSheet(names, keywords) {
  return names.find(n =>
    keywords.some(k => n.toLowerCase().includes(k.toLowerCase()))
  )
}

function parseSalesSheet(rows) {
  if (!rows || rows.length < 2) return null
  const headers = rows[0].map(h => String(h).toLowerCase().trim())
  const dateIdx  = headers.findIndex(h => h.includes('วันที่') || h.includes('date'))
  const nameIdx  = headers.findIndex(h => h.includes('ชื่อ') || h.includes('name'))
  const catIdx   = headers.findIndex(h => h.includes('หมวด') || h.includes('cat'))
  const qtyIdx   = headers.findIndex(h => h.includes('จำนวน') || h.includes('qty'))
  const totalIdx = headers.findIndex(h => h.includes('ยอด') || h.includes('total') || h.includes('amount'))

  const records = rows.slice(1).map(row => ({
    date:     row[dateIdx] || '',
    name:     row[nameIdx] || '',
    category: row[catIdx]  || '',
    qty:      parseNum(row[qtyIdx]),
    total:    parseNum(row[totalIdx])
  })).filter(r => r.total > 0)

  const byYear = {}
  records.forEach(r => {
    const year = extractYear(r.date)
    if (!year) return
    if (!byYear[year]) byYear[year] = []
    byYear[year].push(r)
  })

  const monthly = {}, yearly = {}
  Object.entries(byYear).forEach(([year, recs]) => {
    const months = Array(12).fill(0)
    let total = 0, qty = 0
    recs.forEach(r => {
      const mo = extractMonth(r.date)
      if (mo >= 0) months[mo] += r.total
      total += r.total
      qty   += r.qty
    })
    monthly[year] = months
    yearly[year]  = { total, qty, txn: recs.length }
  })

  const prodMap = {}
  records.forEach(r => {
    if (!prodMap[r.name]) prodMap[r.name] = { name: r.name, total: 0, qty: 0, category: r.category }
    prodMap[r.name].total += r.total
    prodMap[r.name].qty   += r.qty
  })
  const topProds = Object.values(prodMap).sort((a,b) => b.total - a.total).slice(0, 20)

  const catTotals = {}
  records.forEach(r => { catTotals[r.category] = (catTotals[r.category] || 0) + r.total })

  return { records, monthly, yearly, topProds, catTotals }
}

function parseTargetsSheet(rows) {
  if (!rows || rows.length < 2) return null
  const headers = rows[0].map(h => String(h).toLowerCase().trim())
  const yearIdx    = headers.findIndex(h => h.includes('ปี') || h.includes('year'))
  const monthIdx   = headers.findIndex(h => h.includes('เดือน') || h.includes('month'))
  const targetIdx  = headers.findIndex(h => h.includes('เป้า') || h.includes('target'))
  const actualIdx  = headers.findIndex(h => h.includes('จริง') || h.includes('actual'))
  const expenseIdx = headers.findIndex(h => h.includes('ค่าใช้จ่าย') || h.includes('expense'))

  const tData = {}
  rows.slice(1).forEach(row => {
    let year = String(row[yearIdx] || '').trim()
    if (year.length === 4 && parseInt(year) > 2500) year = String(parseInt(year) - 543)
    const mo = parseInt(row[monthIdx]) - 1
    if (!year || isNaN(mo) || mo < 0 || mo > 11) return
    if (!tData[year]) tData[year] = {
      targets: Array(12).fill(0), actuals: Array(12).fill(0),
      expenses: Array(12).fill(0), totalTarget: 0, totalActual: 0
    }
    tData[year].targets[mo]  = parseNum(row[targetIdx])
    tData[year].actuals[mo]  = parseNum(row[actualIdx])
    tData[year].expenses[mo] = parseNum(row[expenseIdx])
  })

  Object.values(tData).forEach(d => {
    d.totalTarget = d.targets.reduce((a,b) => a+b, 0)
    d.totalActual = d.actuals.reduce((a,b) => a+b, 0)
  })
  return tData
}

function parseNum(v) {
  if (v === '' || v == null) return 0
  return parseFloat(String(v).replace(/,/g,'')) || 0
}

function extractYear(dateStr) {
  if (!dateStr) return null
  const s = String(dateStr)
  if (typeof dateStr === 'number') {
    // Excel serial date
    const d = XLSX.SSF.parse_date_code(dateStr)
    if (d) return String(d.y)
  }
  const iso = s.match(/^(\d{4})[-/]/)
  if (iso) { const y = parseInt(iso[1]); return y > 2500 ? String(y-543) : String(y) }
  const th = s.match(/\d{2}[-/]\d{2}[-/](\d{4})/)
  if (th) { const y = parseInt(th[1]); return y > 2500 ? String(y-543) : String(y) }
  return null
}

function extractMonth(dateStr) {
  if (!dateStr) return -1
  const s = String(dateStr)
  if (typeof dateStr === 'number') {
    const d = XLSX.SSF.parse_date_code(dateStr)
    if (d) return d.m - 1
  }
  const iso = s.match(/^\d{4}[-/](\d{2})/)
  if (iso) return parseInt(iso[1]) - 1
  const th = s.match(/\d{2}[-/](\d{2})[-/]\d{4}/)
  if (th) return parseInt(th[1]) - 1
  return -1
}
