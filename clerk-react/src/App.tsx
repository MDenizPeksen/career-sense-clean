import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Login, Signup } from './features/auth'
import { ProtectedRoute } from './components/auth'
import Header from './components/layout/Header'
import CvUpload from './features/cv-upload/CvUpload'
import Dashboard from './features/dashboard/Dashboard'
import './App.css'

function App() {
  return (
    <Router>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          {/* Public routes */}
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

          {/* Home page */}
          <Route
            path="/"
            element={
              <div className="max-w-3xl mx-auto text-center py-12">
                <h1 className="text-4xl font-bold text-blue-600 mb-6">Welcome to CareerSense</h1>
                <p className="text-xl mb-8">Your AI-powered career guidance platform</p>
                <div className="flex justify-center space-x-4">
                  <Link
                    to="/upload"
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Analyze my CV
                  </Link>
                </div>
              </div>
            }
          />
        </Routes>
      </main>
    </Router>
  )
}

export default App
