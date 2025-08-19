import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import styled from 'styled-components'
import { FiLoader } from 'react-icons/fi'

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`

const LoadingCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`

const Spinner = styled.div`
  animation: spin 1s linear infinite;
  font-size: 24px;
  color: #667eea;
  margin-bottom: 15px;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`

const LoadingText = styled.p`
  color: #666;
  margin: 0;
  font-size: 16px;
`

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requiredPermission = null,
  fallbackPath = '/login' 
}) => {
  const { user, profile, loading, hasRole, hasPermission } = useAuth()
  const location = useLocation()

  // Loading state
  if (loading) {
    return (
      <LoadingContainer>
        <LoadingCard>
          <Spinner>
            <FiLoader />
          </Spinner>
          <LoadingText>Yükleniyor...</LoadingText>
        </LoadingCard>
      </LoadingContainer>
    )
  }

  // Not authenticated
  if (!user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />
  }

  // Role check
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />
  }

  // Permission check
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />
  }

  // All checks passed
  return children
}

export default ProtectedRoute
