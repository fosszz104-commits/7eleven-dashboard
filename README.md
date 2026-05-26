# 7-ELEVEN Sales Dashboard v2.0

React app — ดู dashboard ออนไลน์ได้ทั้งทีม  
รองรับ 2 แหล่งข้อมูล: **Excel Upload** และ **Google Sheets (realtime)**

---

## โครงสร้างไฟล์

```
src/
├── App.jsx                  ← หลัก — ควบคุม state ทั้งหมด
├── data.js                  ← ข้อมูล static (ตัวอย่าง)
├── index.css                ← CSS ทั้งหมด
├── components/
│   ├── Sidebar.jsx          ← เมนูซ้าย
│   ├── Topbar.jsx           ← แถบบนสุด + toggle แหล่งข้อมูล
│   ├── PageHome.jsx         ← หน้าภาพรวม 2569
│   ├── PageSales.jsx        ← หน้ายอดขาย
│   ├── PageTargets.jsx      ← หน้าเป้าหมาย
│   ├── PageBranches.jsx     ← หน้าสาขา
│   ├── UploadModal.jsx      ← popup อัปโหลด Excel
│   └── SheetsModal.jsx      ← popup เชื่อม Google Sheets
├── hooks/
│   └── useSheets.js         ← ดึงข้อมูลจาก Google Sheets API
└── utils/
    └── parseExcel.js        ← อ่านและแปลงไฟล์ Excel
```

---

## วิธีรันใน local

```bash
# 1. ติดตั้ง dependencies
npm install

# 2. สร้างไฟล์ .env (ถ้าจะใช้ Google Sheets)
cp .env.example .env
# แก้ไข VITE_SHEETS_API_KEY=...

# 3. รัน dev server
npm run dev
# เปิด http://localhost:5173
```

---

## Deploy ออนไลน์

### Vercel (แนะนำ — ฟรี)
1. push โค้ดขึ้น GitHub
2. ไป vercel.com → Import Repository
3. ตั้ง Environment Variable: `VITE_SHEETS_API_KEY`
4. Deploy → ได้ URL แชร์ทีมได้เลย

### Netlify
1. `npm run build` → ได้โฟลเดอร์ `dist/`
2. ลาก `dist/` ไปวางที่ app.netlify.com/drop
3. ได้ URL ทันที

---

## ตั้งค่า Google Sheets API

1. ไป https://console.cloud.google.com
2. สร้าง project ใหม่ (หรือใช้ existing)
3. ค้นหา "Sheets API" → Enable
4. ไป Credentials → Create Credentials → API Key
5. คัดลอก key ใส่ใน .env: `VITE_SHEETS_API_KEY=...`

**ตั้ง Sheets ให้อ่านได้:**
- เปิด Google Sheets → Share → Anyone with the link → Viewer

**รูปแบบ Sheets:**

Sheet "Sales":
| วันที่ | รหัส | ชื่อสินค้า | หมวด | จำนวน | ยอดขาย |

Sheet "Targets":
| ปี | เดือน | เป้าหมาย | ยอดจริง | ค่าใช้จ่าย |

รองรับปี พ.ศ. (2566) และ ค.ศ. (2023) อัตโนมัติ

---

## แก้ไขข้อมูล static

แก้ที่ `src/data.js` — มีข้อมูลทั้งหมดอยู่ที่นี่:
- `MONTHLY` — ยอดขายรายเดือนแต่ละปี
- `T_DATA` — เป้าหมาย + ยอดจริง + ค่าใช้จ่าย
- `TOP_PRODS` — สินค้าขายดี
- `TOP_BRANCHES` — สาขา top 10
