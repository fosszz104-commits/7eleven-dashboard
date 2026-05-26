export default function Topbar({ page, dataSource, onDataSource, onUpload, onSheetsConnect, lastSync }) {
  const PAGE_META = {
    home:     { title: '🏠 ภาพรวมเป้าหมาย ปี 2569', sub: 'CP ALL 7-Eleven | ยูอีคอฟ & ฟีแคร์ | YTD Q1 2569' },
    sales:    { title: '📊 ยอดขาย (Sales Dashboard)', sub: 'ยอดขายประจำปี 2566–2568 | ยูอีคอฟ & ฟีแคร์' },
    targets:  { title: '🎯 เป้าหมาย 2566–2568 (History)', sub: 'เปรียบเทียบ Actual vs Target | % Achievement' },
    branches: { title: '🏪 สาขา (Branches)', sub: 'ประสิทธิภาพสาขา & การกระจายตามภูมิภาค' },
  }
  const meta = PAGE_META[page] || PAGE_META.home

  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">{meta.title}</div>
        <div className="topbar-sub">
          {meta.sub}
          {lastSync && (
            <span style={{ marginLeft: 8, color: '#059669' }}>
              ✓ sync {lastSync.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      <div className="topbar-right">
        {/* Data source toggle */}
        <div className="ds-toggle">
          <label>แหล่งข้อมูล:</label>
          <select value={dataSource} onChange={e => onDataSource(e.target.value)}>
            <option value="static">ข้อมูลตัวอย่าง</option>
            <option value="excel">Excel Upload</option>
            <option value="sheets">Google Sheets</option>
          </select>
        </div>

        {dataSource === 'excel' && (
          <button className="btn btn-green" onClick={onUpload}>
            📂 อัปโหลด Excel
          </button>
        )}
        {dataSource === 'sheets' && (
          <button className="btn btn-green" onClick={onSheetsConnect}>
            🔗 เชื่อม Sheets
          </button>
        )}
      </div>
    </header>
  )
}
