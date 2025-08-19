import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoginForm from './components/auth/LoginForm'
import Dashboard from './components/dashboard/Dashboard'
import './App.css'

// Toast configuration
const toastConfig = {
  duration: 4000,
  position: 'top-right',
  style: {
    background: '#363636',
    color: '#fff',
  },
  success: {
    duration: 3000,
    iconTheme: {
      primary: '#4ade80',
      secondary: '#fff',
    },
  },
  error: {
    duration: 4000,
    iconTheme: {
      primary: '#f87171',
      secondary: '#fff',
    },
  },
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster toastOptions={toastConfig} />
          
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginForm />} />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard/*" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect root to dashboard */}
            <Route 
              path="/" 
              element={<Navigate to="/dashboard" replace />} 
            />
            
            {/* Catch all route */}
            <Route 
              path="*" 
              element={<Navigate to="/dashboard" replace />} 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
