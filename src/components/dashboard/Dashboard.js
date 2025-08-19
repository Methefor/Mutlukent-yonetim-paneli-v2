import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate, Routes, Route } from 'react-router-dom'
import styled from 'styled-components'
import { 
  FiUser, 
  FiLogOut, 
  FiSettings, 
  FiMenu, 
  FiX,
  FiDollarSign,
  FiShoppingCart,
  FiAlertTriangle,
  FiFileText,
  FiUsers,
  FiHome,
  FiBarChart3
} from 'react-icons/fi'
import SalesModule from '../modules/sales/SalesModule'

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
`

const Sidebar = styled.div`
  width: ${props => props.isOpen ? '280px' : '0'};
  background: white;
  border-right: 1px solid #e2e8f0;
  transition: width 0.3s ease;
  overflow: hidden;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  
  @media (max-width: 768px) {
    position: fixed;
    height: 100vh;
    left: ${props => props.isOpen ? '0' : '-280px'};
  }
`

const SidebarHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  
  h2 {
    color: #1e293b;
    font-size: 20px;
    font-weight: 700;
    margin: 0;
  }
  
  p {
    color: #64748b;
    margin: 5px 0 0 0;
    font-size: 14px;
  }
`

const SidebarMenu = styled.nav`
  padding: 1rem 0;
`

const MenuItem = styled.div`
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${props => props.active ? '#3b82f6' : '#64748b'};
  background: ${props => props.active ? '#eff6ff' : 'transparent'};
  border-right: ${props => props.active ? '3px solid #3b82f6' : 'none'};
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: ${props => props.active ? '600' : '500'};
  
  &:hover {
    background: ${props => props.active ? '#eff6ff' : '#f1f5f9'};
    color: ${props => props.active ? '#3b82f6' : '#475569'};
  }
  
  svg {
    font-size: 18px;
  }
`

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`

const Header = styled.header`
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const MenuButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  
  &:hover {
    background: #f1f5f9;
    color: #475569;
  }
  
  @media (min-width: 769px) {
    display: none;
  }
`

const Logo = styled.div`
  h1 {
    color: #1e293b;
    font-size: 24px;
    font-weight: 700;
    margin: 0;
  }
  
  p {
    color: #64748b;
    margin: 0;
    font-size: 14px;
  }
`

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f1f5f9;
  border-radius: 8px;
  
  span {
    color: #475569;
    font-weight: 500;
  }
`

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &.primary {
    background: #3b82f6;
    color: white;
    
    &:hover {
      background: #2563eb;
    }
  }
  
  &.secondary {
    background: #f1f5f9;
    color: #475569;
    
    &:hover {
      background: #e2e8f0;
    }
  }
`

const Content = styled.main`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
`

const WelcomeCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`

const WelcomeTitle = styled.h2`
  color: #1e293b;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 1rem 0;
`

const WelcomeText = styled.p`
  color: #64748b;
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #3b82f6;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`

const StatTitle = styled.h3`
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const StatValue = styled.div`
  color: #1e293b;
  font-size: 32px;
  font-weight: 700;
  margin: 0;
`

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: ${props => props.isOpen ? 'block' : 'none'};
  
  @media (min-width: 769px) {
    display: none;
  }
`



const OrdersModule = () => (
  <WelcomeCard>
    <WelcomeTitle>Sipariş Yönetim Modülü</WelcomeTitle>
    <WelcomeText>Bu modül henüz geliştirme aşamasındadır.</WelcomeText>
  </WelcomeCard>
)

const TicketsModule = () => (
  <WelcomeCard>
    <WelcomeTitle>Arıza ve Talep Takip Modülü</WelcomeTitle>
    <WelcomeText>Bu modül henüz geliştirme aşamasındadır.</WelcomeText>
  </WelcomeCard>
)

const DocumentsModule = () => (
  <WelcomeCard>
    <WelcomeTitle>Belge Yönetim Modülü</WelcomeTitle>
    <WelcomeText>Bu modül henüz geliştirme aşamasındadır.</WelcomeText>
  </WelcomeCard>
)

const HRModule = () => (
  <WelcomeCard>
    <WelcomeTitle>İK ve Personel Modülü</WelcomeTitle>
    <WelcomeText>Bu modül henüz geliştirme aşamasındadır.</WelcomeText>
  </WelcomeCard>
)

const Dashboard = () => {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeModule, setActiveModule] = useState('dashboard')

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const menuItems = [
    { id: 'dashboard', label: 'Ana Sayfa', icon: FiHome, path: '/dashboard' },
    { id: 'sales', label: 'Satış ve Finans', icon: FiDollarSign, path: '/dashboard/sales' },
    { id: 'orders', label: 'Sipariş Yönetimi', icon: FiShoppingCart, path: '/dashboard/orders' },
    { id: 'tickets', label: 'Arıza ve Talep', icon: FiAlertTriangle, path: '/dashboard/tickets' },
    { id: 'documents', label: 'Belge Yönetimi', icon: FiFileText, path: '/dashboard/documents' },
    { id: 'hr', label: 'İK ve Personel', icon: FiUsers, path: '/dashboard/hr' },
  ]

  const handleMenuClick = (item) => {
    setActiveModule(item.id)
    navigate(item.path)
    setSidebarOpen(false)
  }

  const DashboardHome = () => (
    <>
      <WelcomeCard>
        <WelcomeTitle>
          Hoş geldiniz, {profile?.full_name || 'Kullanıcı'}!
        </WelcomeTitle>
        <WelcomeText>
          MİYOP yönetim paneline başarıyla giriş yaptınız. 
          Sol menüden istediğiniz modüle erişebilirsiniz.
        </WelcomeText>
      </WelcomeCard>

      <StatsGrid>
        <StatCard onClick={() => handleMenuClick(menuItems[1])}>
          <StatTitle>Toplam Satış</StatTitle>
          <StatValue>₺0</StatValue>
        </StatCard>
        
        <StatCard onClick={() => handleMenuClick(menuItems[2])}>
          <StatTitle>Aktif Siparişler</StatTitle>
          <StatValue>0</StatValue>
        </StatCard>
        
        <StatCard onClick={() => handleMenuClick(menuItems[3])}>
          <StatTitle>Açık Talepler</StatTitle>
          <StatValue>0</StatValue>
        </StatCard>
        
        <StatCard onClick={() => handleMenuClick(menuItems[5])}>
          <StatTitle>Personel Sayısı</StatTitle>
          <StatValue>0</StatValue>
        </StatCard>
      </StatsGrid>

      <WelcomeCard>
        <WelcomeTitle>Hızlı Erişim</WelcomeTitle>
        <WelcomeText>
          Yukarıdaki kartlara tıklayarak ilgili modüllere hızlıca erişebilirsiniz.
        </WelcomeText>
      </WelcomeCard>
    </>
  )

  return (
    <DashboardContainer>
      <Overlay isOpen={sidebarOpen} onClick={() => setSidebarOpen(false)} />
      
      <Sidebar isOpen={sidebarOpen}>
        <SidebarHeader>
          <h2>MİYOP</h2>
          <p>Mutlukent İş Yönetim Paneli</p>
        </SidebarHeader>
        
        <SidebarMenu>
          {menuItems.map((item) => (
            <MenuItem
              key={item.id}
              active={activeModule === item.id}
              onClick={() => handleMenuClick(item)}
            >
              <item.icon />
              {item.label}
            </MenuItem>
          ))}
        </SidebarMenu>
      </Sidebar>

      <MainContent>
        <Header>
          <HeaderLeft>
            <MenuButton onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <FiX /> : <FiMenu />}
            </MenuButton>
            <Logo>
              <h1>MİYOP</h1>
              <p>Mutlukent İş Yönetim Paneli</p>
            </Logo>
          </HeaderLeft>
          
          <UserMenu>
            <UserInfo>
              <FiUser />
              <span>{profile?.full_name || user?.email}</span>
            </UserInfo>
            
            <Button className="secondary">
              <FiSettings />
              Ayarlar
            </Button>
            
            <Button className="primary" onClick={handleSignOut}>
              <FiLogOut />
              Çıkış
            </Button>
          </UserMenu>
        </Header>

        <Content>
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/sales" element={<SalesModule />} />
            <Route path="/orders" element={<OrdersModule />} />
            <Route path="/tickets" element={<TicketsModule />} />
            <Route path="/documents" element={<DocumentsModule />} />
            <Route path="/hr" element={<HRModule />} />
          </Routes>
        </Content>
      </MainContent>
    </DashboardContainer>
  )
}

export default Dashboard
