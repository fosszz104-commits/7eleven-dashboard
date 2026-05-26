export default function Sidebar({ activePage, onNav }) {
  const items = [
    { id: 'home',     icon: '🏠', label: 'ภาพรวม 2569' },
    { id: 'sales',    icon: '📊', label: 'ยอดขาย' },
    { id: 'targets',  icon: '🎯', label: 'เป้าหมาย' },
    { id: 'branches', icon: '🏪', label: 'สาขา' },
        { id: 'mt', icon: '🏬', label: 'Modern Trade' },
  ]

  return (
    <aside className="sidebar">
      <div className="sb-logo">
        <span className="sb-badge">7-ELEVEN<span>.</span></span>
        <div className="sb-tagline">Sales Management System<br />CP ALL | ยูอีคอฟ & ฟีแคร์</div>
      </div>

      <div className="sb-section">เมนูหลัก</div>
      <ul className="sb-nav">
        {items.map(item => (
          <li key={item.id}>
            <a
              className={activePage === item.id ? 'active' : ''}
              onClick={() => onNav(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="sb-footer">
        <div className="sb-user">
          <div className="sb-avatar">👤</div>
          <div className="sb-user-info">
            <div className="sb-user-name">Sales Team</div>
            <div className="sb-user-role">Dashboard v2.0</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
