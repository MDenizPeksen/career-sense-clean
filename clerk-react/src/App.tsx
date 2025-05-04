import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Login, Signup } from './features/auth'
import { ProtectedRoute } from './components/auth'
import Header from './components/layout/Header'
import './App.css'

function App() {
  return (
    <Router>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected routes will be added here */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <div className="p-8">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p>This is a protected route. You can only see this if you're logged in.</p>
              </div>
            </ProtectedRoute>
          } />
          
          {/* Home page */}
          <Route path="/" element={
            <div className="max-w-3xl mx-auto text-center py-12">
              <h1 className="text-4xl font-bold text-blue-600 mb-6">Welcome to CareerSense</h1>
              <p className="text-xl mb-8">Your AI-powered career guidance platform</p>
              <div className="flex justify-center space-x-4">
                <a href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Get Started
                </a>
              </div>
            </div>
          } />
        </Routes>
      </main>
    </Router>
  )
}

export default App
