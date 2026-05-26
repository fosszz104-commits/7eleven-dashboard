import { useEffect, useRef, useState } from 'react'
import { Chart, registerables } from 'chart.js'
import { fB, fBF } from '../data.js'

Chart.register(...registerables)

// ─── MT DATA (ปรับตัวเลขได้ใน data.js ภายหลัง) ───────────
const MT_DATA = {
  MT1: [
    { name: 'CP ALL 7-Eleven', tier: 1, target: 129207300, actual: 26522852, color: '#E31837' },
    { name: 'Pure',            tier: 2, target: 8500000,  actual: 7200000,  color: '#EC4899' },
    { name: 'Makro',           tier: 2, target: 6200000,  actual: 5800000,  color: '#EC4899' },
    { name: 'TOPs',            tier: 2, target: 5800000,  actual: 4900000,  color: '#EC4899' },
    { name: 'Watson',          tier: 3, target: 4200000,  actual: 3100000,  color: '#EC4899' },
    { name: 'กรุงเทพดรักสโตร์', tier: 3, target: 3800000, actual: 2900000,  color: '#EC4899' },
    { name: 'P&F',             tier: 3, target: 3200000,  actual: 2400000,  color: '#EC4899' },
    { name: 'Drug Care',       tier: 3, target: 2900000,  actual: 2100000,  color: '#EC4899' },
    { name: 'ธรรมชาติเพื่อสุขภาพ', tier: 3, target: 2500000, actual: 1800000, color: '#EC4899' },
    { name: 'Health Support House', tier: 3, target: 2200000, actual: 1600000, color: '#EC4899' },
    { name: 'CDIP',            tier: 3, target: 1900000,  actual: 1400000,  color: '#EC4899' },
  ],
  MT2: [
    { name: 'Lotus',           tier: 2, target: 9200000,  actual: 8100000,  color: '#F59E0B' },
    { name: 'CJ Express',      tier: 2, target: 7400000,  actual: 6200000,  color: '#F59E0B' },
    { name: 'Boots',           tier: 2, target: 6800000,  actual: 5700000,  color: '#F59E0B' },
    { name: 'Jiffy',           tier: 3, target: 4100000,  actual: 3200000,  color: '#F59E0B' },
    { name: 'Boonruksa',       tier: 3, target: 3600000,  actual: 2800000,  color: '#F59E0B' },
    { name: 'Save Drug',       tier: 3, target: 3300000,  actual: 2500000,  color: '#F59E0B' },
    { name: 'Lawson',          tier: 3, target: 3000000,  actual: 2200000,  color: '#F59E0B' },
    { name: 'PT Max Mart',     tier: 3, target: 2700000,  actual: 1900000,  color: '#F59E0B' },
    { name: 'Dr.Pharma',       tier: 3, target: 2400000,  actual: 1700000,  color: '#F59E0B' },
    { name: 'Tsuruha',         tier: 3, target: 2100000,  actual: 1500000,  color: '#F59E0B' },
  ]
}

const GROUP_COLOR = { MT1: '#E31837', MT2: '#F59E0B' }
const GROUP_LABEL = { MT1: 'MT1 — ช่องทางหลัก', MT2: 'MT2 — ช่องทางรอง' }

export default function PageMT() {
  const [activeGroup, setActiveGroup] = useState('both') // 'both' | 'MT1' | 'MT2'
  const refChart = useRef(null)
  const instChart = useRef(null)

  const groups = activeGroup === 'both' ? ['MT1','MT2'] : [activeGroup]

  const allRows = groups.flatMap(g =>
    MT_DATA[g].map(r => ({ ...r, group: g }))
  )

  // KPI totals
  const totalTarget = allRows.reduce((a,r) => a + r.target, 0)
  const totalActual = allRows.reduce((a,r) => a + r.actual, 0)
  const achRate = totalTarget > 0 ? (totalActual / totalTarget * 100).toFixed(1) : 0
  const gap = totalTarget - totalActual

  useEffect(() => {
    instChart.current?.destroy()

    const topRows = [...allRows]
      .filter(r => r.name !== 'CP ALL 7-Eleven')
      .sort((a,b) => b.actual - a.actual)
      .slice(0, 12)

    instChart.current = new Chart(refChart.current, {
      type: 'bar',
      data: {
        labels: topRows.map(r => r.name),
        datasets: [
          {
            label: 'เป้าหมาย',
            data: topRows.map(r => r.target),
            backgroundColor: '#1E293B22',
            borderColor: '#1E293B',
            borderWidth: 1.5,
            borderRadius: 3
          },
          {
            label: 'ยอดจริง',
            data: topRows.map(r => r.actual),
            backgroundColor: topRows.map(r =>
              r.actual >= r.target ? '#00843DBB' :
              r.actual >= r.target * 0.8 ? '#F59E0BBB' : '#E31837BB'
            ),
            borderColor: topRows.map(r =>
              r.actual >= r.target ? '#00843D' :
              r.actual >= r.target * 0.8 ? '#F59E0B' : '#E31837'
            ),
            borderWidth: 1.5,
            borderRadius: 3
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { usePointStyle: true, padding: 12, font: { size: 11 } } },
          tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${fBF(c.parsed.y)}` } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: { ticks: { callback: v => fB(v) }, grid: { color: '#F1F5F9' } }
        }
      }
    })

    return () => instChart.current?.destroy()
  }, [activeGroup])

  return (
    <div className="page-body">
      {/* Group toggle */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        <span style={{ fontWeight:700, color:'var(--muted)', fontSize:13 }}>กลุ่ม:</span>
        {['both','MT1','MT2'].map(g => (
          <button key={g}
            className={`yr-btn ${activeGroup === g ? 'active' : ''}`}
            style={ activeGroup === g && g !== 'both' ? { background: GROUP_COLOR[g], borderColor: GROUP_COLOR[g] } : {} }
            onClick={() => setActiveGroup(g)}
          >
            {g === 'both' ? 'ทั้งหมด' : g}
          </button>
        ))}
      </div>

      {/* KPI row */}
      <div className="sec">📊 ตัวชี้วัดรวม Modern Trade</div>
      <div className="kpi-row kpi-4">
        <div className="kpi-card c-blue">
          <div className="kv-ico">🎯</div>
          <div className="kv-lbl">เป้าหมายรวม</div>
          <div className="kv-val">{fB(totalTarget)}</div>
          <div className="kv-bdg neu">{allRows.length} ห้าง</div>
        </div>
        <div className="kpi-card c-red">
          <div className="kv-ico">💰</div>
          <div className="kv-lbl">ยอดจริง YTD</div>
          <div className="kv-val">{fB(totalActual)}</div>
          <div className={`kv-bdg ${parseFloat(achRate) >= 100 ? 'up' : 'dn'}`}>
            {parseFloat(achRate) >= 100 ? '▲' : '▼'} {achRate}%
          </div>
        </div>
        <div className="kpi-card c-orange">
          <div className="kv-ico">📉</div>
          <div className="kv-lbl">ช่องว่างจากเป้า</div>
          <div className="kv-val">{fB(gap)}</div>
          <div className="kv-bdg neu">ที่ต้องตาม</div>
        </div>
        <div className="kpi-card c-green">
          <div className="kv-ico">✅</div>
          <div className="kv-lbl">ถึงเป้า</div>
          <div className="kv-val">{allRows.filter(r => r.actual >= r.target).length}</div>
          <div className="kv-bdg up">จาก {allRows.length} ห้าง</div>
        </div>
      </div>

      {/* Chart */}
      <div className="sec">📊 เปรียบเทียบยอดขายรายห้าง</div>
      <div className="chart-card" style={{ marginBottom:20 }}>
        <div className="ch-head">
          <div>
            <div className="ch-title">Target vs Actual รายห้าง (ไม่รวม 7-Eleven)</div>
            <div className="ch-sub">🟢 เกินเป้า | 🟡 80–99% | 🔴 ต่ำกว่า 80%</div>
          </div>
          <span className="ch-tag">Bar</span>
        </div>
        <div style={{ height: 300 }}><canvas ref={refChart} /></div>
      </div>

      {/* Tables by group */}
      {groups.map(g => (
        <div key={g} style={{ marginBottom: 24 }}>
          <div className="sec" style={{ borderLeftColor: GROUP_COLOR[g] }}>
            <span style={{ color: GROUP_COLOR[g] }}>{g}</span> — {GROUP_LABEL[g]}
          </div>

          {/* Group KPI */}
          {(() => {
            const rows = MT_DATA[g]
            const gTarget = rows.reduce((a,r) => a+r.target, 0)
            const gActual = rows.reduce((a,r) => a+r.actual, 0)
            const gAch = gTarget > 0 ? (gActual/gTarget*100).toFixed(1) : 0
            return (
              <div style={{ display:'flex', gap:12, marginBottom:14, flexWrap:'wrap' }}>
                {[
                  { label:'เป้าหมายรวม', val: fB(gTarget) },
                  { label:'ยอดจริงรวม',  val: fB(gActual) },
                  { label:'Achievement', val: gAch + '%' },
                  { label:'จำนวนห้าง',   val: rows.length + ' ห้าง' },
                ].map(k => (
                  <div key={k.label} style={{
                    background:'var(--bg)', border:'1px solid var(--border)',
                    borderRadius:10, padding:'10px 16px', minWidth:120
                  }}>
                    <div style={{ fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:4 }}>{k.label}</div>
                    <div style={{ fontSize:18, fontWeight:800, color: GROUP_COLOR[g] }}>{k.val}</div>
                  </div>
                ))}
              </div>
            )
          })()}

          <div className="tbl-card" style={{ padding:0 }}>
            <table className="dt">
              <thead>
                <tr>
                  <th>#</th>
                  <th>ห้าง / ช่องทาง</th>
                  <th>Tier</th>
                  <th style={{ textAlign:'right' }}>เป้าหมาย</th>
                  <th style={{ textAlign:'right' }}>ยอดจริง YTD</th>
                  <th>Achievement</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {MT_DATA[g].map((r, i) => {
                  const ach = r.target > 0 ? (r.actual / r.target * 100).toFixed(1) : 0
                  const isOver = r.actual >= r.target
                  const isWarn = !isOver && r.actual >= r.target * 0.8
                  return (
                    <tr key={r.name}>
                      <td>{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{r.name}</td>
                      <td>
                        <span className="pill" style={{
                          background: r.tier === 1 ? '#FEF2F2' : r.tier === 2 ? '#FFF7ED' : '#F8FAFC',
                          color: r.tier === 1 ? '#991B1B' : r.tier === 2 ? '#92400E' : '#475569'
                        }}>
                          Tier {r.tier}
                        </span>
                      </td>
                      <td style={{ textAlign:'right' }}>{r.target.toLocaleString('th')}</td>
                      <td style={{ textAlign:'right', fontWeight:700 }}>{r.actual.toLocaleString('th')}</td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div className="progress-track" style={{ width:80 }}>
                            <div
                              className={`progress-fill ${isOver ? 'pf-green' : isWarn ? 'pf-orange' : 'pf-red'}`}
                              style={{ width: Math.min(parseFloat(ach), 100) + '%' }}
                            />
                          </div>
                          <span style={{ fontSize:11, color:'var(--muted)', minWidth:36 }}>{ach}%</span>
                        </div>
                      </td>
                      <td>
                        {isOver
                          ? <span className="pill p-green">เกินเป้า ✅</span>
                          : isWarn
                          ? <span className="pill p-orange">ใกล้เป้า ⚠️</span>
                          : <span className="pill p-red">ต่ำกว่าเป้า ❌</span>
                        }
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr style={{ background:'#F8FAFC', fontWeight:700 }}>
                  <td colSpan={3}>รวม {g}</td>
                  <td style={{ textAlign:'right' }}>
                    {MT_DATA[g].reduce((a,r)=>a+r.target,0).toLocaleString('th')}
                  </td>
                  <td style={{ textAlign:'right', color:'var(--red)' }}>
                    {MT_DATA[g].reduce((a,r)=>a+r.actual,0).toLocaleString('th')}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
