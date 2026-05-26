import { useEffect, useRef, useState } from 'react'
import { Chart, registerables } from 'chart.js'
import { YEARLY, MONTHLY, CAT_TOTALS, CAT_YEAR, TOP_PRODS, CATS, YEARS, COLORS, TH_M, fB, fBF } from '../data.js'

Chart.register(...registerables)

const CPILL = {
  "ยาน้ำแก้ไอ (ผู้ใหญ่)": "p-red",
  "ยาอม/เม็ดอมสมุนไพร": "p-green",
  "ฟีแคร์ (ทดสอบตั้งครรภ์)": "p-orange",
  "ยาแก้ไอ (สูตรเด็ก)": "p-blue"
}

export default function PageSales({ salesData }) {
  const [sortKey, setSortKey] = useState('total')
  const [sortDir, setSortDir] = useState(-1)

  const refTrend   = useRef(null)
  const refDonut   = useRef(null)
  const refBar     = useRef(null)
  const refStacked = useRef(null)
  const instTrend  = useRef(null)
  const instDonut  = useRef(null)
  const instBar    = useRef(null)
  const instStacked = useRef(null)

  // Use live data if available, else static
  const yearly  = salesData?.yearly  || YEARLY
  const monthly = salesData?.monthly || MONTHLY
  const catTotals = salesData?.catTotals || CAT_TOTALS
  const topProds  = salesData?.topProds  || TOP_PRODS
  const years = Object.keys(monthly).filter(y => ['2023','2024','2025'].includes(y))

  const totalAll = Object.values(yearly).reduce((a,b) => a + (b.total||0), 0)
  const latestYear = years[years.length - 1]
  const prevYear   = years[years.length - 2]
  const yoyPct = prevYear && yearly[prevYear]?.total > 0
    ? ((yearly[latestYear]?.total - yearly[prevYear]?.total) / yearly[prevYear]?.total * 100).toFixed(1)
    : '—'
  const totalQty = Object.values(yearly).reduce((a,b) => a + (b.qty||0), 0)
  const avgMonthly = totalAll / (years.length * 12)

  useEffect(() => {
    instTrend.current?.destroy()
    instDonut.current?.destroy()
    instBar.current?.destroy()
    instStacked.current?.destroy()

    // Trend
    instTrend.current = new Chart(refTrend.current, {
      type: 'line',
      data: {
        labels: TH_M,
        datasets: years.map(y => ({
          label: y === '2023' ? '2566' : y === '2024' ? '2567' : '2568',
          data: monthly[y] || [],
          borderColor: COLORS[y],
          backgroundColor: COLORS[y] + '15',
          borderWidth: y === latestYear ? 3 : 1.5,
          tension: .35, fill: y === latestYear,
          pointRadius: 3, pointHoverRadius: 6
        }))
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        interaction:{ mode:'index', intersect:false },
        plugins:{ legend:{ position:'top', labels:{ usePointStyle:true, padding:12, font:{ size:11 } } },
          tooltip:{ callbacks:{ label: c => ` ${c.dataset.label}: ${fBF(c.parsed.y)}` } } },
        scales:{ x:{ grid:{ display:false } }, y:{ beginAtZero:false, ticks:{ callback: v => fB(v) }, grid:{ color:'#F1F5F9' } } }
      }
    })

    // Donut
    const cats = Object.keys(catTotals)
    const catColors = cats.map(c => COLORS[c] || '#94A3B8')
    instDonut.current = new Chart(refDonut.current, {
      type: 'doughnut',
      data: {
        labels: cats,
        datasets: [{ data: Object.values(catTotals), backgroundColor: catColors, borderWidth: 2, hoverOffset: 6 }]
      },
      options: {
        responsive:true, maintainAspectRatio:false, cutout:'65%',
        plugins:{ legend:{ position:'bottom', labels:{ usePointStyle:true, padding:10, font:{ size:11 } } },
          tooltip:{ callbacks:{ label: c => ` ${c.label}: ${fB(c.parsed)}` } } }
      }
    })

    // Bar
    instBar.current = new Chart(refBar.current, {
      type: 'bar',
      data: {
        labels: TH_M,
        datasets: years.map(y => ({
          label: y === '2023' ? '2566' : y === '2024' ? '2567' : '2568',
          data: monthly[y] || [],
          backgroundColor: COLORS[y] + 'CC',
          borderColor: COLORS[y],
          borderWidth: 1, borderRadius: 3
        }))
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        interaction:{ mode:'index', intersect:false },
        plugins:{ legend:{ position:'top', labels:{ usePointStyle:true, padding:12, font:{ size:11 } } } },
        scales:{ x:{ grid:{ display:false } }, y:{ ticks:{ callback: v => fB(v) }, grid:{ color:'#F1F5F9' } } }
      }
    })

    // Stacked
    const catYearData = salesData ? buildCatYearFromData(salesData, years) : CAT_YEAR
    instStacked.current = new Chart(refStacked.current, {
      type: 'bar',
      data: {
        labels: years.map(y => y === '2023' ? '2566' : y === '2024' ? '2567' : '2568'),
        datasets: CATS.map(cat => ({
          label: cat,
          data: years.map(y => catYearData[cat]?.[y] || 0),
          backgroundColor: COLORS[cat] + 'BB',
          borderColor: COLORS[cat],
          borderWidth: 1
        }))
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ position:'bottom', labels:{ usePointStyle:true, padding:10, font:{ size:11 } } } },
        scales:{
          x:{ stacked:true, grid:{ display:false } },
          y:{ stacked:true, ticks:{ callback: v => fB(v) }, grid:{ color:'#F1F5F9' } }
        }
      }
    })

    return () => {
      instTrend.current?.destroy()
      instDonut.current?.destroy()
      instBar.current?.destroy()
      instStacked.current?.destroy()
    }
  }, [salesData])

  const sorted = [...topProds].sort((a,b) => sortDir * (b[sortKey] - a[sortKey]))

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => -d)
    else { setSortKey(key); setSortDir(-1) }
  }

  return (
    <div className="page-body">
      <div className="info-bar info-green">
        ✅ &nbsp;<span>
          {salesData ? `ข้อมูลจาก ${salesData.source === 'excel' ? 'Excel' : 'Google Sheets'} — ${Object.values(salesData.records || {}).length} รายการ`
            : 'ข้อมูลตัวอย่าง — 4,071 รายการ | ปี 2566–2568'}
        </span>
      </div>

      <div className="sec">📊 ตัวชี้วัดหลัก</div>
      <div className="kpi-row kpi-4">
        <div className="kpi-card c-red">
          <div className="kv-ico">💰</div><div className="kv-lbl">ยอดขายรวม</div>
          <div className="kv-val">{fB(totalAll)}</div>
          <div className="kv-bdg up">3 ปีรวม 2566–2568</div>
        </div>
        <div className="kpi-card c-green">
          <div className="kv-ico">📈</div><div className="kv-lbl">การเติบโต YoY</div>
          <div className="kv-val">{yoyPct}%</div>
          <div className="kv-bdg up">vs ปีก่อน</div>
        </div>
        <div className="kpi-card c-orange">
          <div className="kv-ico">🧾</div><div className="kv-lbl">จำนวนรายการ</div>
          <div className="kv-val">{fB(totalQty)}</div>
          <div className="kv-bdg neu">ชิ้น / หน่วย</div>
        </div>
        <div className="kpi-card c-blue">
          <div className="kv-ico">📅</div><div className="kv-lbl">ยอดเฉลี่ย/เดือน</div>
          <div className="kv-val">{fB(avgMonthly)}</div>
          <div className="kv-bdg neu">เฉลี่ย 3 ปี</div>
        </div>
      </div>

      <div className="sec">📉 แนวโน้มยอดขาย</div>
      <div className="chart-grid cg-3">
        <div className="chart-card">
          <div className="ch-head">
            <div><div className="ch-title">ยอดขายรายเดือน</div><div className="ch-sub">เปรียบเทียบ 3 ปี</div></div>
            <span className="ch-tag">Line</span>
          </div>
          <div style={{ height: 220 }}><canvas ref={refTrend} /></div>
        </div>
        <div className="chart-card">
          <div className="ch-head">
            <div><div className="ch-title">สัดส่วนหมวดสินค้า</div><div className="ch-sub">รวม 2566–2568</div></div>
            <span className="ch-tag">Donut</span>
          </div>
          <div style={{ height: 220 }}><canvas ref={refDonut} /></div>
        </div>
      </div>

      <div className="chart-grid cg-2">
        <div className="chart-card">
          <div className="ch-head">
            <div><div className="ch-title">ยอดขายรายเดือน แยกปี</div><div className="ch-sub">Grouped Bar</div></div>
            <span className="ch-tag">Bar</span>
          </div>
          <div style={{ height: 220 }}><canvas ref={refBar} /></div>
        </div>
        <div className="chart-card">
          <div className="ch-head">
            <div><div className="ch-title">ยอดขายรายหมวด แยกปี</div><div className="ch-sub">Stacked Bar</div></div>
            <span className="ch-tag">Stacked</span>
          </div>
          <div style={{ height: 220 }}><canvas ref={refStacked} /></div>
        </div>
      </div>

      <div className="sec">🏅 สินค้าขายดี Top {sorted.length}</div>
      <div className="tbl-card">
        <div className="ch-head">
          <div><div className="ch-title">ยอดขายสินค้ารายตัว</div><div className="ch-sub">คลิกหัวตารางเพื่อเรียง</div></div>
          <span className="ch-tag">{sorted.length} รายการ</span>
        </div>
        <table className="dt">
          <thead>
            <tr>
              <th>#</th>
              <th onClick={() => handleSort('name')}>ชื่อสินค้า ↕</th>
              <th onClick={() => handleSort('category')}>หมวด ↕</th>
              <th onClick={() => handleSort('total')} style={{ textAlign:'right' }}>ยอดขาย (฿) ↕</th>
              <th onClick={() => handleSort('qty')} style={{ textAlign:'right' }}>จำนวน ↕</th>
              <th>สัดส่วน</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, i) => {
              const shr = totalAll > 0 ? (p.total / totalAll * 100).toFixed(1) : 0
              return (
                <tr key={p.name}>
                  <td><span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:26, height:26, borderRadius:'50%', fontSize:11, fontWeight:700, background:'#F9FAFB', color:'#9CA3AF' }}>{i+1}</span></td>
                  <td style={{ fontWeight:600, maxWidth:280, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</td>
                  <td><span className={`pill ${CPILL[p.category] || 'p-muted'}`}>{p.category}</span></td>
                  <td style={{ textAlign:'right', fontWeight:700 }}>{p.total.toLocaleString('th')}</td>
                  <td style={{ textAlign:'right' }}>{p.qty.toLocaleString('th')}</td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div className="progress-track" style={{ width:80 }}>
                        <div className="progress-fill pf-red" style={{ width: shr + '%' }} />
                      </div>
                      <span style={{ fontSize:11, color:'var(--muted)', minWidth:30 }}>{shr}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function buildCatYearFromData(salesData, years) {
  const result = {}
  if (!salesData?.records) return CAT_YEAR
  salesData.records.forEach(r => {
    const year = extractYear(r.date)
    if (!year || !years.includes(year)) return
    if (!result[r.category]) result[r.category] = {}
    result[r.category][year] = (result[r.category][year] || 0) + r.total
  })
  return result
}

function extractYear(s) {
  if (!s) return null
  const m = String(s).match(/(\d{4})/)
  if (!m) return null
  const y = parseInt(m[1])
  return y > 2500 ? String(y-543) : String(y)
}
