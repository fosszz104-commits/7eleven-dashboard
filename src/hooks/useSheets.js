import { useState, useCallback } from 'react'

/**
 * useSheets — ดึงข้อมูลจาก Google Sheets ผ่าน Sheets API v4
 *
 * ต้องตั้งค่า:
 *   VITE_SHEETS_API_KEY  = Google API Key (ไม่จำกัด origin สำหรับ dev)
 *   sheetId              = ID ของ Spreadsheet (จาก URL)
 *
 * รูปแบบ Sheets ที่รองรับ:
 *   Sheet ชื่อ "Sales"   — คอลัมน์: วันที่ | รหัส | ชื่อสินค้า | หมวด | จำนวน | ยอดขาย
 *   Sheet ชื่อ "Targets" — คอลัมน์: ปี | เดือน | เป้าหมาย | ยอดจริง | ค่าใช้จ่าย
 */

const API_KEY = import.meta.env.VITE_SHEETS_API_KEY || ''

export function useSheets() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [lastSync, setLastSync] = useState(null)

  const fetchSheets = useCallback(async (sheetId, sheetNames = ['Sales', 'Targets']) => {
    if (!API_KEY) {
      setError('ไม่พบ VITE_SHEETS_API_KEY — ตั้งค่าใน .env ก่อน')
      return
    }
    if (!sheetId) {
      setError('กรุณาใส่ Sheet ID')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const results = {}

      for (const sheetName of sheetNames) {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}?key=${API_KEY}`
        const res = await fetch(url)

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error?.message || `ไม่สามารถดึงข้อมูล ${sheetName}`)
        }

        const json = await res.json()
        results[sheetName] = json.values || []
      }

      // Parse Sales sheet
      const salesData = parseSalesSheet(results['Sales'] || [])
      // Parse Targets sheet
      const targetsData = parseTargetsSheet(results['Targets'] || [])

      setData({ sales: salesData, targets: targetsData, raw: results })
      setLastSync(new Date())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, data, lastSync, fetchSheets }
}

// ─── PARSERS ──────────────────────────────────────────────

function parseSalesSheet(rows) {
  if (rows.length < 2) return null
  const headers = rows[0].map(h => h.toLowerCase().trim())
  const dateIdx = headers.findIndex(h => h.includes('วันที่') || h.includes('date'))
  const nameIdx = headers.findIndex(h => h.includes('ชื่อ') || h.includes('name'))
  const catIdx  = headers.findIndex(h => h.includes('หมวด') || h.includes('category'))
  const qtyIdx  = headers.findIndex(h => h.includes('จำนวน') || h.includes('qty'))
  const totalIdx = headers.findIndex(h => h.includes('ยอด') || h.includes('total') || h.includes('amount'))

  const records = rows.slice(1).map(row => ({
    date:     row[dateIdx] || '',
    name:     row[nameIdx] || '',
    category: row[catIdx]  || '',
    qty:      parseNum(row[qtyIdx]),
    total:    parseNum(row[totalIdx])
  })).filter(r => r.total > 0)

  // Group by year
  const byYear = {}
  records.forEach(r => {
    const year = extractYear(r.date)
    if (!year) return
    if (!byYear[year]) byYear[year] = []
    byYear[year].push(r)
  })

  // Build monthly totals per year
  const monthly = {}
  const yearly  = {}
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

  // Top products
  const prodMap = {}
  records.forEach(r => {
    if (!prodMap[r.name]) prodMap[r.name] = { name: r.name, total: 0, qty: 0, category: r.category }
    prodMap[r.name].total += r.total
    prodMap[r.name].qty   += r.qty
  })
  const topProds = Object.values(prodMap).sort((a,b) => b.total - a.total).slice(0, 20)

  // Category totals
  const catTotals = {}
  records.forEach(r => {
    catTotals[r.category] = (catTotals[r.category] || 0) + r.total
  })

  return { records, monthly, yearly, topProds, catTotals }
}

function parseTargetsSheet(rows) {
  if (rows.length < 2) return null
  const headers = rows[0].map(h => h.toLowerCase().trim())
  const yearIdx    = headers.findIndex(h => h.includes('ปี') || h.includes('year'))
  const monthIdx   = headers.findIndex(h => h.includes('เดือน') || h.includes('month'))
  const targetIdx  = headers.findIndex(h => h.includes('เป้า') || h.includes('target'))
  const actualIdx  = headers.findIndex(h => h.includes('จริง') || h.includes('actual'))
  const expenseIdx = headers.findIndex(h => h.includes('ค่าใช้จ่าย') || h.includes('expense'))

  const tData = {}
  rows.slice(1).forEach(row => {
    let year = String(row[yearIdx] || '').trim()
    // แปลง พ.ศ. → ค.ศ.
    if (year.length === 4 && parseInt(year) > 2500) year = String(parseInt(year) - 543)

    const mo = parseInt(row[monthIdx]) - 1
    if (!year || isNaN(mo) || mo < 0 || mo > 11) return
    if (!tData[year]) tData[year] = {
      targets: Array(12).fill(0),
      actuals: Array(12).fill(0),
      expenses: Array(12).fill(0),
      totalTarget: 0, totalActual: 0
    }
    tData[year].targets[mo]  = parseNum(row[targetIdx])
    tData[year].actuals[mo]  = parseNum(row[actualIdx])
    tData[year].expenses[mo] = parseNum(row[expenseIdx])
  })

  // Calculate totals
  Object.values(tData).forEach(d => {
    d.totalTarget = d.targets.reduce((a,b) => a+b, 0)
    d.totalActual = d.actuals.reduce((a,b) => a+b, 0)
  })

  return tData
}

// ─── HELPERS ──────────────────────────────────────────────
function parseNum(v) {
  if (!v) return 0
  return parseFloat(String(v).replace(/,/g,'')) || 0
}

function extractYear(dateStr) {
  if (!dateStr) return null
  const s = String(dateStr)
  // ISO format
  const iso = s.match(/^(\d{4})[-/]/)
  if (iso) {
    const y = parseInt(iso[1])
    return y > 2500 ? String(y - 543) : String(y)
  }
  // Thai format DD/MM/YYYY or DD-MM-YYYY
  const th = s.match(/\d{2}[-/]\d{2}[-/](\d{4})/)
  if (th) {
    const y = parseInt(th[1])
    return y > 2500 ? String(y - 543) : String(y)
  }
  return null
}

function extractMonth(dateStr) {
  if (!dateStr) return -1
  const s = String(dateStr)
  const iso = s.match(/^\d{4}[-/](\d{2})/)
  if (iso) return parseInt(iso[1]) - 1
  const th = s.match(/\d{2}[-/](\d{2})[-/]\d{4}/)
  if (th) return parseInt(th[1]) - 1
  return -1
}
