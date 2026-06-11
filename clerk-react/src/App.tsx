import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Login, Signup } from './features/auth'
import { ProtectedRoute } from './components/auth'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Home from './features/home/Home'
import CvUpload from './features/cv-upload/CvUpload'
import Dashboard from './features/dashboard/Dashboard'
import MockInterviews from './features/mock-interviews/MockInterviews'
import Discovery from './features/discovery/Discovery'
import CareerPaths from './features/career-paths/CareerPaths'
import Contact from './features/contact/Contact'
import Terms from './features/legal/Terms'
import Privacy from './features/legal/Privacy'
import FeedbackWidget from './features/feedback/FeedbackWidget'
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
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

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
            <Route
              path="/discovery"
              element={
                <ProtectedRoute>
                  <Discovery />
                </ProtectedRoute>
              }
            />
            <Route
              path="/career-paths"
              element={
                <ProtectedRoute>
                  <CareerPaths />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interviews"
              element={
                <ProtectedRoute>
                  <MockInterviews />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
        <FeedbackWidget />
      </div>
    </Router>
  )
}

export default App
