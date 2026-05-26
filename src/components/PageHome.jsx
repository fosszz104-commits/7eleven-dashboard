import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { T_DATA, TH_M, fB, fBF } from '../data.js'

Chart.register(...registerables)

export default function PageHome({ tData }) {
  const d = tData?.['2026'] || T_DATA['2026']
  const chartMonthly = useRef(null)
  const chartAllYears = useRef(null)
  const instanceMonthly = useRef(null)
  const instanceAllYears = useRef(null)

  useEffect(() => {
    // destroy old
    instanceMonthly.current?.destroy()
    instanceAllYears.current?.destroy()

    const targets = d.targets
    const actuals = d.actuals

    // Monthly chart
    const bgColors = actuals.map((a,i) => a > 0 ? (a >= targets[i] ? '#00843D88' : '#E3183788') : '#94A3B844')
    const bdColors = actuals.map((a,i) => a > 0 ? (a >= targets[i] ? '#00843D' : '#E31837') : '#94A3B8')
    const barData  = actuals.map((a,i) => a > 0 ? a : targets[i])

    instanceMonthly.current = new Chart(chartMonthly.current, {
      type: 'bar',
      data: {
        labels: TH_M,
        datasets: [
          { label:'ยอดจริง / แผน', data:barData, backgroundColor:bgColors, borderColor:bdColors, borderWidth:1.5, borderRadius:4, order:2 },
          { label:'เป้าหมาย', data:targets, type:'line', borderColor:'#1E293B', backgroundColor:'transparent',
            borderWidth:2, borderDash:[6,4], pointRadius:4, pointBackgroundColor:'#1E293B', tension:.3, order:1 }
        ]
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        interaction:{ mode:'index', intersect:false },
        plugins:{
          legend:{ position:'top', labels:{ usePointStyle:true, padding:12, font:{ size:11 } } },
          tooltip:{ callbacks:{ label: c => ` ${c.dataset.label}: ${fBF(c.parsed.y)}` } }
        },
        scales:{
          x:{ grid:{ display:false } },
          y:{ beginAtZero:false, ticks:{ callback: v => fB(v) }, grid:{ color:'#F1F5F9' } }
        }
      }
    })

    // All-years comparison
    const allKeys = ['2023','2024','2025','2026']
    const allData = tData || T_DATA
    const tgtTotals = allKeys.map(y => (allData[y]?.totalTarget || T_DATA[y]?.totalTarget || 0) / 1e6)
    const actTotals = allKeys.map(y => (allData[y]?.totalActual || T_DATA[y]?.totalActual || 0) / 1e6)

    instanceAllYears.current = new Chart(chartAllYears.current, {
      type: 'bar',
      data: {
        labels: ['2566','2567','2568','2569 (YTD)'],
        datasets: [
          { label:'เป้าหมาย', data:tgtTotals, backgroundColor:'#1E293B33', borderColor:'#1E293B', borderWidth:1.5, borderRadius:4, borderSkipped:false },
          { label:'ยอดจริง', data:actTotals,
            backgroundColor: actTotals.map((a,i) => a >= tgtTotals[i] ? '#00843DBB' : '#E31837BB'),
            borderColor: actTotals.map((a,i) => a >= tgtTotals[i] ? '#00843D' : '#E31837'),
            borderWidth:1.5, borderRadius:4, borderSkipped:false }
        ]
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        interaction:{ mode:'index', intersect:false },
        plugins:{
          legend:{ position:'top', labels:{ usePointStyle:true, padding:12, font:{ size:11 } } },
          tooltip:{ callbacks:{ label: c => ` ${c.dataset.label}: ${c.parsed.y.toFixed(2)}M ฿` } }
        },
        scales:{
          x:{ grid:{ display:false } },
          y:{ beginAtZero:true, ticks:{ callback: v => v+'M' }, grid:{ color:'#F1F5F9' } }
        }
      }
    })

    return () => {
      instanceMonthly.current?.destroy()
      instanceAllYears.current?.destroy()
    }
  }, [d, tData])

  const achRate = d.totalTarget > 0 ? (d.totalActual / d.totalTarget * 100).toFixed(1) : 0
  const remaining = d.totalTarget - d.totalActual

  return (
    <div className="page-body">
      <div className="sec">📌 ตัวชี้วัดหลัก ปี 2569</div>
      <div className="kpi-row kpi-4">
        <div className="kpi-card c-blue">
          <div className="kv-ico">🎯</div>
          <div className="kv-lbl">เป้าหมายรวมปี 2569</div>
          <div className="kv-val">{fB(d.totalTarget)}</div>
          <div className="kv-bdg up">▲ เพิ่ม 5.3% vs ปีก่อน</div>
          <div className="kv-sub">เป้าหมาย CP ALL 7-Eleven</div>
        </div>
        <div className="kpi-card c-red">
          <div className="kv-ico">💰</div>
          <div className="kv-lbl">ยอดขาย YTD (Q1)</div>
          <div className="kv-val">{fB(d.totalActual)}</div>
          <div className="kv-bdg dn">▼ {achRate}% vs เป้า Q1</div>
          <div className="kv-sub">ม.ค.–มี.ค. 2569 | 3 เดือน</div>
        </div>
        <div className="kpi-card c-orange">
          <div className="kv-ico">📦</div>
          <div className="kv-lbl">เป้าที่เหลือ (Q2–Q4)</div>
          <div className="kv-val">{fB(remaining)}</div>
          <div className="kv-bdg neu">9 เดือนที่เหลือ</div>
          <div className="kv-sub">เม.ย.–ธ.ค. 2569</div>
        </div>
        <div className="kpi-card c-green">
          <div className="kv-ico">💸</div>
          <div className="kv-lbl">งบ Marketing 2569</div>
          <div className="kv-val">3.32M</div>
          <div className="kv-bdg neu">Promotion + Trade</div>
          <div className="kv-sub">ตามแผน Action Plan</div>
        </div>
      </div>

      <div className="sec">📊 แผนเป้าหมายรายเดือน ปี 2569</div>
      <div className="chart-grid cg-full">
        <div className="chart-card">
          <div className="ch-head">
            <div>
              <div className="ch-title">Target vs Actual รายเดือน 2569</div>
              <div className="ch-sub">สีเขียว = เกินเป้า | สีแดง = ต่ำกว่าเป้า | สีเทา = ยังไม่มีข้อมูล</div>
            </div>
            <span className="ch-tag">Mixed Chart</span>
          </div>
          <div style={{ height: 280 }}>
            <canvas ref={chartMonthly} />
          </div>
        </div>
      </div>

      <div className="chart-grid cg-2">
        <div className="chart-card">
          <div className="ch-head">
            <div>
              <div className="ch-title">เปรียบเทียบยอดขายทุกปี</div>
              <div className="ch-sub">2566–2569 | เป้าหมาย vs จริง (M ฿)</div>
            </div>
            <span className="ch-tag">Bar</span>
          </div>
          <div style={{ height: 240 }}>
            <canvas ref={chartAllYears} />
          </div>
        </div>

        <div style={{ background:'var(--card)', borderRadius:'var(--r)', padding:'20px 24px', boxShadow:'var(--sh)', overflowX:'auto' }}>
          <div style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:4 }}>📋 ยอดขาย Q1 ปี 2569 รายเดือน</div>
          <div style={{ fontSize:12, color:'var(--muted)', marginBottom:16 }}>ม.ค.–มี.ค. 2569 | ข้อมูลจริง</div>
          <table className="dt" style={{ fontSize:13 }}>
            <thead>
              <tr>
                <th>เดือน</th>
                <th style={{ textAlign:'right' }}>เป้าหมาย</th>
                <th style={{ textAlign:'right' }}>ยอดจริง</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {['ม.ค. 2569','ก.พ. 2569','มี.ค. 2569'].map((m, i) => {
                const tgt = d.targets[i], act = d.actuals[i]
                const p = tgt > 0 ? (act/tgt*100).toFixed(1) : 0
                return (
                  <tr key={i}>
                    <td style={{ fontWeight:600 }}>{m}</td>
                    <td style={{ textAlign:'right' }}>{tgt.toLocaleString('th')}</td>
                    <td style={{ textAlign:'right', fontWeight:700 }}>{act.toLocaleString('th')}</td>
                    <td><span className="pill p-red">{p}%</span></td>
                  </tr>
                )
              })}
              <tr style={{ background:'#F8FAFC', fontWeight:700 }}>
                <td>รวม Q1</td>
                <td style={{ textAlign:'right' }}>{d.targets.slice(0,3).reduce((a,b)=>a+b,0).toLocaleString('th')}</td>
                <td style={{ textAlign:'right', color:'var(--neg)' }}>{d.totalActual.toLocaleString('th')}</td>
                <td><span className="pill p-red">{achRate}%</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
