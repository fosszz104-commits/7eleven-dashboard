import { useState } from 'react'
import { useSheets } from '../hooks/useSheets.js'

export default function SheetsModal({ onClose, onData }) {
  const [sheetId, setSheetId] = useState('')
  const { loading, error, fetchSheets } = useSheets()

  async function handleConnect() {
    // Extract ID from URL if pasted
    const id = sheetId.includes('spreadsheets/d/')
      ? sheetId.split('spreadsheets/d/')[1].split('/')[0]
      : sheetId.trim()

    const result = await fetchSheets(id)
    if (result) { onData(result); onClose() }
  }

  const hasKey = !!import.meta.env.VITE_SHEETS_API_KEY

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-head">
          <h3>🔗 เชื่อมต่อ Google Sheets</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {!hasKey && (
          <div className="info-bar info-orange" style={{ marginBottom:16 }}>
            ⚠️ ยังไม่ได้ตั้งค่า <code>VITE_SHEETS_API_KEY</code> ใน .env
          </div>
        )}

        <div className="sheets-form">
          <div>
            <label>Google Sheets URL หรือ Sheet ID</label>
            <input
              type="text"
              value={sheetId}
              onChange={e => setSheetId(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
            />
          </div>

          <div className="modal-fmt">
            <strong>📋 รูปแบบ Sheets ที่รองรับ:</strong><br />
            • Sheet "Sales" — วันที่ | ชื่อสินค้า | หมวด | จำนวน | ยอดขาย<br />
            • Sheet "Targets" — ปี | เดือน | เป้าหมาย | ยอดจริง | ค่าใช้จ่าย<br />
            • ต้องตั้ง Sheets เป็น Anyone with link can view
          </div>

          {error && (
            <div className="info-bar" style={{ background:'#FEF2F2', border:'1px solid #FCA5A5', color:'#991B1B', marginBottom:0 }}>
              ❌ {error}
            </div>
          )}

          <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
            <button className="btn btn-outline" onClick={onClose}>ยกเลิก</button>
            <button className="btn btn-green" onClick={handleConnect} disabled={loading || !sheetId}>
              {loading ? '⏳ กำลังดึงข้อมูล...' : '🔗 เชื่อมต่อ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
