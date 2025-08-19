import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import styled from 'styled-components'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`

const LoginCard = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
`

const Logo = styled.div`
  text-align: center;
  margin-bottom: 30px;
  
  h1 {
    color: #333;
    font-size: 28px;
    font-weight: 700;
    margin: 0;
  }
  
  p {
    color: #666;
    margin: 5px 0 0 0;
    font-size: 14px;
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const FormGroup = styled.div`
  position: relative;
`

const Input = styled.input`
  width: 100%;
  padding: 15px 15px 15px 45px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &::placeholder {
    color: #999;
  }
`

const Icon = styled.div`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 18px;
`

const PasswordToggle = styled.button`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 18px;
  
  &:hover {
    color: #667eea;
  }
`

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 14px;
  margin-top: 5px;
  text-align: center;
`

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm()

  const onSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      const { error } = await signIn(data.email, data.password)
      
      if (error) {
        setError('root', {
          type: 'manual',
          message: error.message
        })
        toast.error('Giriş başarısız!')
      } else {
        toast.success('Başarıyla giriş yapıldı!')
        navigate('/dashboard')
      }
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: 'Bir hata oluştu. Lütfen tekrar deneyin.'
      })
      toast.error('Bir hata oluştu!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <h1>MİYOP</h1>
          <p>Mutlukent İş Yönetim Paneli</p>
        </Logo>
        
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Icon>
              <FiMail />
            </Icon>
            <Input
              type="email"
              placeholder="E-posta adresiniz"
              {...register('email', {
                required: 'E-posta adresi gereklidir',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Geçerli bir e-posta adresi giriniz'
                }
              })}
            />
            {errors.email && (
              <ErrorMessage>{errors.email.message}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Icon>
              <FiLock />
            </Icon>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Şifreniz"
              {...register('password', {
                required: 'Şifre gereklidir',
                minLength: {
                  value: 6,
                  message: 'Şifre en az 6 karakter olmalıdır'
                }
              })}
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </PasswordToggle>
            {errors.password && (
              <ErrorMessage>{errors.password.message}</ErrorMessage>
            )}
          </FormGroup>

          {errors.root && (
            <ErrorMessage>{errors.root.message}</ErrorMessage>
          )}

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </SubmitButton>
        </Form>
      </LoginCard>
    </LoginContainer>
  )
}

export default LoginForm
