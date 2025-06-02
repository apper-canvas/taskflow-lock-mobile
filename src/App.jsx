import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-primary-50/30 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="mt-12"
        toastClassName="shadow-soft rounded-xl border border-surface-200"
      />
    </div>
  )
}

export default App