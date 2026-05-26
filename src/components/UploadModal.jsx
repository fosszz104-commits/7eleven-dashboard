import { useState, useRef } from 'react'
import { parseExcelFile } from '../utils/parseExcel.js'

export default function UploadModal({ onClose, onData }) {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [over, setOver] = useState(false)
  const inputRef = useRef(null)

  async function handleFile(file) {
    if (!file) return
    setLoading(true)
    setStatus('กำลังอ่านไฟล์...')
    setProgress(20)
    try {
      setProgress(50)
      setStatus('กำลังประมวลผล...')
      const data = await parseExcelFile(file)
      setProgress(100)
      setStatus(`✅ สำเร็จ — ${file.name}`)
      setTimeout(() => { onData(data); onClose() }, 800)
    } catch (err) {
      setStatus('❌ ' + err.message)
      setProgress(0)
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-head">
          <h3>📂 อัปเดตข้อมูล Excel</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div
          className={`drop-zone ${over ? 'over' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setOver(true) }}
          onDragLeave={() => setOver(false)}
          onDrop={e => { e.preventDefault(); setOver(false); handleFile(e.dataTransfer.files[0]) }}
        >
          <div className="dz-icon">📊</div>
          <div className="dz-text">
            <strong>คลิกเพื่อเลือก</strong> หรือลากวางไฟล์ที่นี่<br />
            <span style={{ fontSize:11 }}>รองรับ .xlsx, .xls</span>
          </div>
        </div>

        <input ref={inputRef} type="file" accept=".xlsx,.xls" style={{ display:'none' }}
          onChange={e => handleFile(e.target.files[0])} />

        <div className="modal-fmt">
          <strong>📋 รูปแบบที่รองรับ:</strong><br />
          • Sheet ชื่อ "Sales" | คอลัมน์: วันที่, ชื่อ, หมวด, จำนวน, ยอดขาย<br />
          • Sheet ชื่อ "Targets" | คอลัมน์: ปี, เดือน, เป้าหมาย, ยอดจริง, ค่าใช้จ่าย<br />
          • รองรับวันที่พุทธศักราช (2566) และคริสต์ศักราช (2023)
        </div>

        {loading && (
          <div style={{ marginTop:12 }}>
            <div className="prog-track"><div className="prog-bar" style={{ width: progress + '%' }} /></div>
            <div className="prog-stat">{status}</div>
          </div>
        )}
      </div>
    </div>
  )
}
