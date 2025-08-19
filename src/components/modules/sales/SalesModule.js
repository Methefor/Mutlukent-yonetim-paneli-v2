import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { sales } from '../../../lib/supabase'
import styled from 'styled-components'
import { 
  FiPlus, 
  FiUpload, 
  FiFilter, 
  FiSearch, 
  FiEdit, 
  FiTrash2,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiDownload
} from 'react-icons/fi'
import toast from 'react-hot-toast'

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`

const Title = styled.h1`
  color: #1e293b;
  font-size: 28px;
  font-weight: 700;
  margin: 0;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
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
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #3b82f6;
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
  font-size: 28px;
  font-weight: 700;
  margin: 0;
`

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`

const CardTitle = styled.h2`
  color: #1e293b;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Label = styled.label`
  color: #374151;
  font-size: 14px;
  font-weight: 500;
`

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`

const Textarea = styled.textarea`
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  min-height: 100px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`

const FileUpload = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #3b82f6;
    background: #f8fafc;
  }
  
  &.dragover {
    border-color: #3b82f6;
    background: #eff6ff;
  }
`

const FileInput = styled.input`
  display: none;
`

const UploadText = styled.p`
  color: #6b7280;
  margin: 0.5rem 0 0 0;
  font-size: 14px;
`

const SalesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const SalesItem = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`

const SalesInfo = styled.div`
  flex: 1;
`

const SalesDate = styled.div`
  color: #374151;
  font-weight: 600;
  font-size: 14px;
`

const SalesAmount = styled.div`
  color: #059669;
  font-weight: 700;
  font-size: 18px;
`

const SalesDescription = styled.div`
  color: #6b7280;
  font-size: 14px;
  margin-top: 0.25rem;
`

const SalesActions = styled.div`
  display: flex;
  gap: 0.5rem;
`

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
  
  &.delete:hover {
    background: #fef2f2;
    color: #dc2626;
  }
`

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`

const FilterInput = styled.input`
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
`

const SalesModule = () => {
  const { user } = useAuth()
  const [salesData, setSalesData] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    zReportFile: null
  })
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: ''
  })

  // Load sales data
  useEffect(() => {
    loadSales()
  }, [filters])

  const loadSales = async () => {
    setLoading(true)
    try {
      const { data, error } = await sales.getAll(filters)
      if (error) throw error
      setSalesData(data || [])
    } catch (error) {
      console.error('Error loading sales:', error)
      toast.error('Satış verileri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let zReportUrl = null
      
      // Upload Z-Report if provided
      if (formData.zReportFile) {
        const { data: uploadData, error: uploadError } = await sales.uploadZReport(
          formData.zReportFile,
          Date.now().toString()
        )
        if (uploadError) throw uploadError
        zReportUrl = uploadData
      }

      // Create sale record
      const saleData = {
        date: formData.date,
        amount: parseFloat(formData.amount),
        description: formData.description,
        z_report_url: zReportUrl,
        created_by: user.id
      }

      const { error } = await sales.create(saleData)
      if (error) throw error

      toast.success('Satış kaydı başarıyla oluşturuldu')
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        description: '',
        zReportFile: null
      })
      loadSales()
    } catch (error) {
      console.error('Error creating sale:', error)
      toast.error('Satış kaydı oluşturulurken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, zReportFile: file }))
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bu satış kaydını silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const { error } = await sales.delete(id)
      if (error) throw error
      
      toast.success('Satış kaydı başarıyla silindi')
      loadSales()
    } catch (error) {
      console.error('Error deleting sale:', error)
      toast.error('Satış kaydı silinirken hata oluştu')
    }
  }

  const totalSales = salesData.reduce((sum, sale) => sum + parseFloat(sale.amount), 0)
  const averageSales = salesData.length > 0 ? totalSales / salesData.length : 0

  return (
    <Container>
      <Header>
        <Title>Satış ve Finans Modülü</Title>
        <ButtonGroup>
          <Button className="secondary">
            <FiDownload />
            Rapor İndir
          </Button>
        </ButtonGroup>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatTitle>Toplam Satış</StatTitle>
          <StatValue>₺{totalSales.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>Ortalama Satış</StatTitle>
          <StatValue>₺{averageSales.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>Toplam Kayıt</StatTitle>
          <StatValue>{salesData.length}</StatValue>
        </StatCard>
      </StatsGrid>

      <ContentGrid>
        <Card>
          <CardTitle>
            <FiPlus />
            Yeni Satış Kaydı
          </CardTitle>
          
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Tarih</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Tutar (₺)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Açıklama</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Satış açıklaması..."
              />
            </FormGroup>

            <FormGroup>
              <Label>Z-Raporu (Opsiyonel)</Label>
              <FileUpload>
                <FiUpload size={24} />
                <UploadText>
                  {formData.zReportFile ? formData.zReportFile.name : 'Dosya seçmek için tıklayın'}
                </UploadText>
                <FileInput
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
              </FileUpload>
            </FormGroup>

            <Button type="submit" className="primary" disabled={loading}>
              {loading ? 'Kaydediliyor...' : 'Satış Kaydet'}
            </Button>
          </Form>
        </Card>

        <Card>
          <CardTitle>
            <FiFileText />
            Satış Listesi
          </CardTitle>

          <FilterBar>
            <FilterInput
              type="date"
              placeholder="Başlangıç tarihi"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            />
            <FilterInput
              type="date"
              placeholder="Bitiş tarihi"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            />
            <FilterInput
              type="number"
              placeholder="Min tutar"
              value={filters.minAmount}
              onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
            />
            <FilterInput
              type="number"
              placeholder="Max tutar"
              value={filters.maxAmount}
              onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
            />
          </FilterBar>

          <SalesList>
            {loading ? (
              <EmptyState>Yükleniyor...</EmptyState>
            ) : salesData.length === 0 ? (
              <EmptyState>Henüz satış kaydı bulunmuyor</EmptyState>
            ) : (
              salesData.map((sale) => (
                <SalesItem key={sale.id}>
                  <SalesInfo>
                    <SalesDate>{new Date(sale.date).toLocaleDateString('tr-TR')}</SalesDate>
                    <SalesAmount>₺{parseFloat(sale.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</SalesAmount>
                    {sale.description && (
                      <SalesDescription>{sale.description}</SalesDescription>
                    )}
                  </SalesInfo>
                  <SalesActions>
                    {sale.z_report_url && (
                      <ActionButton title="Z-Raporu İndir">
                        <FiDownload />
                      </ActionButton>
                    )}
                    <ActionButton title="Düzenle">
                      <FiEdit />
                    </ActionButton>
                    <ActionButton 
                      className="delete" 
                      title="Sil"
                      onClick={() => handleDelete(sale.id)}
                    >
                      <FiTrash2 />
                    </ActionButton>
                  </SalesActions>
                </SalesItem>
              ))
            )}
          </SalesList>
        </Card>
      </ContentGrid>
    </Container>
  )
}

export default SalesModule
