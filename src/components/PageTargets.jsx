import { useEffect, useRef, useState } from 'react'
import { Chart, registerables } from 'chart.js'
import { T_DATA, TH_M, fB, fBF } from '../data.js'

Chart.register(...registerables)

export default function PageTargets({ tData }) {
  const [year, setYear] = useState('2025')
  const refChart = useRef(null)
  const instChart = useRef(null)

  const allData = tData || T_DATA
  const d = allData[year] || T_DATA[year] || T_DATA['2025']
  const years = Object.keys(allData).filter(y => ['2023','2024','2025','2026'].includes(y))

  const achRate = d.totalTarget > 0 ? (d.totalActual / d.totalTarget * 100).toFixed(1) : 0
  const totalExp = d.expenses.reduce((a,b) => a+b, 0)
  const overMonths  = d.actuals.filter((a,i) => a > 0 && a >= d.targets[i]).length
  const underMonths = d.actuals.filter((a,i) => a > 0 && a < d.targets[i]).length

  const YEAR_LABELS = { '2023':'2566 (2023)', '2024':'2567 (2024)', '2025':'2568 (2025)', '2026':'2569 (2026)' }

  useEffect(() => {
    instChart.current?.destroy()
    instChart.current = new Chart(refChart.current, {
      type: 'bar',
      data: {
        labels: TH_M,
        datasets: [
          {
            label: 'ยอดจริง',
            data: d.actuals.map((a,i) => a > 0 ? a : null),
            backgroundColor: d.actuals.map((a,i) => a > 0 ? (a >= d.targets[i] ? '#00843DBB' : '#E31837BB') : 'transparent'),
            borderColor: d.actuals.map((a,i) => a > 0 ? (a >= d.targets[i] ? '#00843D' : '#E31837') : 'transparent'),
            borderWidth: 1.5, borderRadius: 4, order: 2
          },
          {
            label: 'เป้าหมาย',
            data: d.targets,
            type: 'line',
            borderColor: '#1E293B',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [6,4],
            pointRadius: 4,
            pointBackgroundColor: '#1E293B',
            tension: .3, order: 1
          }
        ]
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        interaction:{ mode:'index', intersect:false },
        plugins:{
          legend:{ position:'top', labels:{ usePointStyle:true, padding:12, font:{ size:11 } } },
          tooltip:{ callbacks:{ label: c => ` ${c.dataset.label}: ${fBF(c.parsed.y || 0)}` } }
        },
        scales:{
          x:{ grid:{ display:false } },
          y:{ beginAtZero:false, ticks:{ callback: v => fB(v) }, grid:{ color:'#F1F5F9' } }
        }
      }
    })
    return () => instChart.current?.destroy()
  }, [year, tData])

  return (
    <div className="page-body">
      <div className="info-bar info-blue">
        🎯 &nbsp;<strong>เป้าหมาย vs ยอดขายจริง vs ค่าใช้จ่าย</strong> | ปี 2566–2569
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        <span style={{ fontWeight:700, color:'var(--muted)', fontSize:13 }}>เลือกปี:</span>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {years.map(y => (
            <button key={y} className={`yr-btn ${year === y ? 'active' : ''}`} onClick={() => setYear(y)}>
              {YEAR_LABELS[y] || y}
            </button>
          ))}
        </div>
      </div>

      <div className="sec">🎯 ภาพรวม Achievement <span style={{ color:'var(--red)', fontWeight:800 }}>{YEAR_LABELS[year] || year}</span></div>
      <div className="kpi-row kpi-4">
        <div className="kpi-card c-green">
          <div className="kv-ico">✅</div><div className="kv-lbl">Achievement Rate</div>
          <div className="kv-val">{achRate}%</div>
          <div className={`kv-bdg ${parseFloat(achRate) >= 100 ? 'up' : 'dn'}`}>
            {parseFloat(achRate) >= 100 ? '▲ เกินเป้า' : '▼ ต่ำกว่าเป้า'}
          </div>
        </div>
        <div className="kpi-card c-blue">
          <div className="kv-ico">🎯</div><div className="kv-lbl">เป้าหมายรวม</div>
          <div className="kv-val">{fB(d.totalTarget)}</div>
          <div className="kv-bdg neu">ทั้งปี</div>
        </div>
        <div className="kpi-card c-red">
          <div className="kv-ico">💰</div><div className="kv-lbl">ยอดจริงรวม</div>
          <div className="kv-val">{fB(d.totalActual)}</div>
          <div className="kv-bdg neu">ทั้งปี</div>
        </div>
        <div className="kpi-card c-orange">
          <div className="kv-ico">💸</div><div className="kv-lbl">ค่าใช้จ่ายรวม</div>
          <div className="kv-val">{fB(totalExp)}</div>
          <div className="kv-bdg neu">Marketing + Trade</div>
        </div>
      </div>

      <div className="chart-grid cg-full">
        <div className="chart-card">
          <div className="ch-head">
            <div>
              <div className="ch-title">Target vs Actual รายเดือน — {YEAR_LABELS[year] || year}</div>
              <div className="ch-sub">
                ✅ เกินเป้า {overMonths} เดือน &nbsp;|&nbsp; ❌ ต่ำกว่าเป้า {underMonths} เดือน
              </div>
            </div>
            <span className="ch-tag">Mixed Chart</span>
          </div>
          <div style={{ height: 280 }}><canvas ref={refChart} /></div>
        </div>
      </div>

      {/* Monthly detail table */}
      <div className="sec">📋 รายละเอียดรายเดือน</div>
      <div className="tbl-card">
        <table className="dt">
          <thead>
            <tr>
              <th>เดือน</th>
              <th style={{ textAlign:'right' }}>เป้าหมาย</th>
              <th style={{ textAlign:'right' }}>ยอดจริง</th>
              <th style={{ textAlign:'right' }}>ค่าใช้จ่าย</th>
              <th>Achievement</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {TH_M.map((m, i) => {
              const tgt = d.targets[i], act = d.actuals[i], exp = d.expenses[i]
              const p = tgt > 0 ? (act/tgt*100).toFixed(1) : '—'
              const hasData = act > 0
              return (
                <tr key={m}>
                  <td style={{ fontWeight:600 }}>{m} {parseInt(year)+543}</td>
                  <td style={{ textAlign:'right' }}>{tgt.toLocaleString('th')}</td>
                  <td style={{ textAlign:'right', fontWeight: hasData ? 700 : 400, color: hasData ? 'var(--text)' : 'var(--muted)' }}>
                    {hasData ? act.toLocaleString('th') : '—'}
                  </td>
                  <td style={{ textAlign:'right', color:'var(--muted)' }}>
                    {exp > 0 ? exp.toLocaleString('th') : '—'}
                  </td>
                  <td>
                    {hasData ? (
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div className="progress-track" style={{ width:80 }}>
                          <div className={`progress-fill ${parseFloat(p) >= 100 ? 'pf-green' : parseFloat(p) >= 80 ? 'pf-orange' : 'pf-red'}`}
                               style={{ width: Math.min(parseFloat(p), 100) + '%' }} />
                        </div>
                        <span style={{ fontSize:11, color:'var(--muted)' }}>{p}%</span>
                      </div>
                    ) : <span style={{ color:'var(--muted)', fontSize:12 }}>ยังไม่มีข้อมูล</span>}
                  </td>
                  <td>
                    {!hasData ? <span className="pill p-muted">รอข้อมูล</span>
                      : parseFloat(p) >= 100 ? <span className="pill p-green">เกินเป้า ✅</span>
                      : <span className="pill p-red">ต่ำกว่าเป้า ❌</span>}
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
