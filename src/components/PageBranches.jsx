import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { TOP_BRANCHES, fB } from '../data.js'

Chart.register(...registerables)

const REGIONS = ["กรุงเทพฯ","ภาคเหนือ","ภาคกลาง","ภาคใต้","อีสาน"]
const REGION_COLORS = { "กรุงเทพฯ":"#E31837","ภาคเหนือ":"#3B82F6","ภาคกลาง":"#FF6600","ภาคใต้":"#00843D","อีสาน":"#8B5CF6" }

export default function PageBranches() {
  const refBar = useRef(null)
  const refPie = useRef(null)
  const instBar = useRef(null)
  const instPie = useRef(null)

  useEffect(() => {
    instBar.current?.destroy()
    instPie.current?.destroy()

    instBar.current = new Chart(refBar.current, {
      type: 'bar',
      data: {
        labels: TOP_BRANCHES.map(b => b.name),
        datasets: [{
          label: 'ยอดขาย',
          data: TOP_BRANCHES.map(b => b.total),
          backgroundColor: TOP_BRANCHES.map(b => REGION_COLORS[b.region] + 'BB'),
          borderColor: TOP_BRANCHES.map(b => REGION_COLORS[b.region]),
          borderWidth: 1.5, borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:false }, tooltip:{ callbacks:{ label: c => ` ${fB(c.parsed.x)} ฿` } } },
        scales:{ x:{ ticks:{ callback: v => fB(v) }, grid:{ color:'#F1F5F9' } }, y:{ grid:{ display:false } } }
      }
    })

    // Region pie
    const regionTotals = {}
    TOP_BRANCHES.forEach(b => { regionTotals[b.region] = (regionTotals[b.region]||0) + b.total })
    instPie.current = new Chart(refPie.current, {
      type: 'doughnut',
      data: {
        labels: Object.keys(regionTotals),
        datasets: [{
          data: Object.values(regionTotals),
          backgroundColor: Object.keys(regionTotals).map(r => REGION_COLORS[r] || '#94A3B8'),
          borderWidth: 2, hoverOffset: 6
        }]
      },
      options: {
        responsive:true, maintainAspectRatio:false, cutout:'60%',
        plugins:{ legend:{ position:'bottom', labels:{ usePointStyle:true, padding:10, font:{ size:11 } } },
          tooltip:{ callbacks:{ label: c => ` ${c.label}: ${fB(c.parsed)}` } } }
      }
    })

    return () => { instBar.current?.destroy(); instPie.current?.destroy() }
  }, [])

  return (
    <div className="page-body">
      <div className="sec">🏪 Top 10 สาขา</div>
      <div className="chart-grid cg-3">
        <div className="chart-card">
          <div className="ch-head">
            <div><div className="ch-title">ยอดขาย Top 10 สาขา</div><div className="ch-sub">เรียงจากมากไปน้อย</div></div>
            <span className="ch-tag">Bar H</span>
          </div>
          <div style={{ height: 320 }}><canvas ref={refBar} /></div>
        </div>
        <div className="chart-card">
          <div className="ch-head">
            <div><div className="ch-title">สัดส่วนตามภูมิภาค</div><div className="ch-sub">% ยอดขาย</div></div>
            <span className="ch-tag">Donut</span>
          </div>
          <div style={{ height: 260 }}><canvas ref={refPie} /></div>
        </div>
      </div>

      <div className="sec">📋 รายละเอียดสาขา</div>
      <div className="tbl-card">
        <table className="dt">
          <thead>
            <tr>
              <th>#</th><th>สาขา</th><th>ภูมิภาค</th>
              <th style={{ textAlign:'right' }}>ยอดขาย</th>
              <th>Growth</th><th>สัดส่วน</th>
            </tr>
          </thead>
          <tbody>
            {TOP_BRANCHES.map((b, i) => {
              const total = TOP_BRANCHES.reduce((a,x) => a+x.total, 0)
              const shr = (b.total/total*100).toFixed(1)
              return (
                <tr key={b.name}>
                  <td><span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:26, height:26, borderRadius:'50%', fontSize:11, fontWeight:700, background:'#F9FAFB', color:'#9CA3AF' }}>{i+1}</span></td>
                  <td style={{ fontWeight:700 }}>{b.name}</td>
                  <td><span className="pill" style={{ background: REGION_COLORS[b.region]+'22', color: REGION_COLORS[b.region] }}>{b.region}</span></td>
                  <td style={{ textAlign:'right', fontWeight:700 }}>{fB(b.total)}</td>
                  <td>
                    <span style={{ color: b.growth >= 0 ? 'var(--pos)' : 'var(--neg)', fontWeight:700, fontSize:13 }}>
                      {b.growth >= 0 ? '▲' : '▼'} {Math.abs(b.growth)}%
                    </span>
                  </td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div className="progress-track" style={{ width:80 }}>
                        <div className="progress-fill pf-blue" style={{ width: shr + '%' }} />
                      </div>
                      <span style={{ fontSize:11, color:'var(--muted)' }}>{shr}%</span>
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
