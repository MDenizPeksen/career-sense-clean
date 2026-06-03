import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Login, Signup } from './features/auth'
import { ProtectedRoute } from './components/auth'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Home from './features/home/Home'
import CvUpload from './features/cv-upload/CvUpload'
import Dashboard from './features/dashboard/Dashboard'
import './App.css'

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 w-full py-8">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login/*" element={<Login />} />
            <Route path="/signup/*" element={<Signup />} />

            {/* Protected routes */}
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <CvUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
