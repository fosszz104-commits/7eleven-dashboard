import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'
import PageHome from './components/PageHome.jsx'
import PageSales from './components/PageSales.jsx'
import PageTargets from './components/PageTargets.jsx'
import PageBranches from './components/PageBranches.jsx'
import PageMT from './components/PageMT.jsx
import UploadModal from './components/UploadModal.jsx'
import SheetsModal from './components/SheetsModal.jsx'

export default function App() {
  const [page, setPage] = useState('home')
  const [dataSource, setDataSource] = useState('static')
  const [liveData, setLiveData] = useState(null)
  const [lastSync, setLastSync] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const [showSheets, setShowSheets] = useState(false)

  function handleData(data) {
    setLiveData(data)
    setLastSync(new Date())
  }

  function handleDataSource(src) {
    setDataSource(src)
    // Reset live data when switching to static
    if (src === 'static') { setLiveData(null); setLastSync(null) }
  }

  // Merge live data with static
  const tData  = liveData?.targets || null
  const salesData = liveData?.sales  || null

  return (
    <div className="app">
      <Sidebar activePage={page} onNav={setPage} />

      <div className="main">
        <Topbar
          page={page}
          dataSource={dataSource}
          onDataSource={handleDataSource}
          onUpload={() => setShowUpload(true)}
          onSheetsConnect={() => setShowSheets(true)}
          lastSync={lastSync}
        />

        {page === 'home'     && <PageHome tData={tData} />}
        {page === 'sales'    && <PageSales salesData={salesData} />}
        {page === 'targets'  && <PageTargets tData={tData} />}
        {page === 'branches' && <PageBranches />}
        {page === 'mt' && <PageMT />}
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onData={data => { handleData(data); setDataSource('excel') }}
        />
      )}
      {showSheets && (
        <SheetsModal
          onClose={() => setShowSheets(false)}
          onData={data => { handleData(data); setDataSource('sheets') }}
        />
      )}
    </div>
  )
}
