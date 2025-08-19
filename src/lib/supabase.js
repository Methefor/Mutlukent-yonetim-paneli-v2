import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helper functions
export const auth = {
  // Sign up with email and password
  signUp: async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helper functions
export const db = {
  // Get user profile
  getUserProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  // Update user profile
  updateUserProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
    return { data, error }
  },

  // Get users with roles
  getUsers: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Get user's sube (branch)
  getUserSube: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('sube_id, subeler(*)')
      .eq('id', userId)
      .single()
    return { data, error }
  }
}

// 1. CİRO RAPORLARI MODÜLÜ
export const ciroRaporlari = {
  // Get all ciro reports
  getAll: async (filters = {}) => {
    let query = supabase
      .from('ciro_raporlari')
      .select(`
        *,
        profiles!ciro_raporlari_created_by_fkey(full_name),
        subeler!ciro_raporlari_sube_id_fkey(sube_adi, sube_kodu)
      `)
      .order('tarih', { ascending: false })

    if (filters.startDate) {
      query = query.gte('tarih', filters.startDate)
    }
    if (filters.endDate) {
      query = query.lte('tarih', filters.endDate)
    }
    if (filters.minAmount) {
      query = query.gte('toplam_ciro', filters.minAmount)
    }
    if (filters.maxAmount) {
      query = query.lte('toplam_ciro', filters.maxAmount)
    }
    if (filters.subeId) {
      query = query.eq('sube_id', filters.subeId)
    }

    const { data, error } = await query
    return { data, error }
  },

  // Get single ciro report
  getById: async (id) => {
    const { data, error } = await supabase
      .from('ciro_raporlari')
      .select(`
        *,
        profiles!ciro_raporlari_created_by_fkey(full_name),
        subeler!ciro_raporlari_sube_id_fkey(sube_adi, sube_kodu)
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  // Create ciro report
  create: async (ciroData) => {
    const { data, error } = await supabase
      .from('ciro_raporlari')
      .insert([ciroData])
      .select()
      .single()
    return { data, error }
  },

  // Update ciro report
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('ciro_raporlari')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Delete ciro report
  delete: async (id) => {
    const { error } = await supabase
      .from('ciro_raporlari')
      .delete()
      .eq('id', id)
    return { error }
  },

  // Upload Z-Report
  uploadZReport: async (file, raporId) => {
    const fileName = `z-reports/${raporId}/${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from('miyop-files')
      .upload(fileName, file)
    
    if (error) return { error }
    
    const { data: urlData } = supabase.storage
      .from('miyop-files')
      .getPublicUrl(fileName)
    
    return { data: urlData.publicUrl, error: null }
  }
}

// 2. SİPARİŞLER MODÜLÜ
export const siparisler = {
  // Get all orders
  getAll: async (filters = {}) => {
    let query = supabase
      .from('siparisler')
      .select(`
        *,
        profiles!siparisler_created_by_fkey(full_name),
        subeler!siparisler_sube_id_fkey(sube_adi, sube_kodu),
        siparis_detaylari(*)
      `)
      .order('created_at', { ascending: false })

    if (filters.durum) {
      query = query.eq('durum', filters.durum)
    }
    if (filters.musteriAdi) {
      query = query.ilike('musteri_adi', `%${filters.musteriAdi}%`)
    }
    if (filters.subeId) {
      query = query.eq('sube_id', filters.subeId)
    }

    const { data, error } = await query
    return { data, error }
  },

  // Get single order
  getById: async (id) => {
    const { data, error } = await supabase
      .from('siparisler')
      .select(`
        *,
        profiles!siparisler_created_by_fkey(full_name),
        subeler!siparisler_sube_id_fkey(sube_adi, sube_kodu),
        siparis_detaylari(*)
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  // Create order
  create: async (siparisData, detaylar) => {
    const { data: siparis, error: siparisError } = await supabase
      .from('siparisler')
      .insert([siparisData])
      .select()
      .single()

    if (siparisError) return { error: siparisError }

    if (detaylar && detaylar.length > 0) {
      const siparisDetaylari = detaylar.map(detay => ({
        ...detay,
        siparis_id: siparis.id
      }))

      const { error: detayError } = await supabase
        .from('siparis_detaylari')
        .insert(siparisDetaylari)

      if (detayError) return { error: detayError }
    }

    return { data: siparis, error: null }
  },

  // Update order
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('siparisler')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Delete order
  delete: async (id) => {
    const { error } = await supabase
      .from('siparisler')
      .delete()
      .eq('id', id)
    return { error }
  }
}

// 3. ARIZA TALEPLERİ MODÜLÜ
export const arizaTalepleri = {
  // Get all tickets
  getAll: async (filters = {}) => {
    let query = supabase
      .from('ariza_talepleri')
      .select(`
        *,
        profiles!ariza_talepleri_created_by_fkey(full_name),
        atanan_profil:profiles!ariza_talepleri_atanan_kisi_fkey(full_name),
        subeler!ariza_talepleri_sube_id_fkey(sube_adi, sube_kodu),
        ariza_talep_ekleri(*)
      `)
      .order('created_at', { ascending: false })

    if (filters.durum) {
      query = query.eq('durum', filters.durum)
    }
    if (filters.kategori) {
      query = query.eq('kategori', filters.kategori)
    }
    if (filters.oncelik) {
      query = query.eq('oncelik', filters.oncelik)
    }
    if (filters.atananKisi) {
      query = query.eq('atanan_kisi', filters.atananKisi)
    }
    if (filters.subeId) {
      query = query.eq('sube_id', filters.subeId)
    }

    const { data, error } = await query
    return { data, error }
  },

  // Get single ticket
  getById: async (id) => {
    const { data, error } = await supabase
      .from('ariza_talepleri')
      .select(`
        *,
        profiles!ariza_talepleri_created_by_fkey(full_name),
        atanan_profil:profiles!ariza_talepleri_atanan_kisi_fkey(full_name),
        subeler!ariza_talepleri_sube_id_fkey(sube_adi, sube_kodu),
        ariza_talep_ekleri(*)
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  // Create ticket
  create: async (talepData) => {
    const { data, error } = await supabase
      .from('ariza_talepleri')
      .insert([talepData])
      .select()
      .single()
    return { data, error }
  },

  // Update ticket
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('ariza_talepleri')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Delete ticket
  delete: async (id) => {
    const { error } = await supabase
      .from('ariza_talepleri')
      .delete()
      .eq('id', id)
    return { error }
  },

  // Upload ticket attachment
  uploadAttachment: async (file, talepId) => {
    const fileName = `ariza-talepleri/${talepId}/${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from('miyop-files')
      .upload(fileName, file)
    
    if (error) return { error }
    
    const { data: urlData } = supabase.storage
      .from('miyop-files')
      .getPublicUrl(fileName)
    
    const attachmentData = {
      talep_id: talepId,
      dosya_adi: file.name,
      dosya_url: urlData.publicUrl,
      dosya_tipi: file.type,
      dosya_boyutu: file.size
    }

    const { data: attachment, error: attachmentError } = await supabase
      .from('ariza_talep_ekleri')
      .insert([attachmentData])
      .select()
      .single()

    return { data: attachment, error: attachmentError }
  }
}

// 4. BELGELER MODÜLÜ
export const belgeler = {
  // Get all documents
  getAll: async (filters = {}) => {
    let query = supabase
      .from('belgeler')
      .select(`
        *,
        profiles!belgeler_yukleyen_kisi_fkey(full_name),
        subeler!belgeler_sube_id_fkey(sube_adi, sube_kodu)
      `)
      .order('created_at', { ascending: false })

    if (filters.kategori) {
      query = query.eq('kategori', filters.kategori)
    }
    if (filters.search) {
      query = query.or(`baslik.ilike.%${filters.search}%,aciklama.ilike.%${filters.search}%`)
    }
    if (filters.etiketler && filters.etiketler.length > 0) {
      query = query.overlaps('etiketler', filters.etiketler)
    }
    if (filters.subeId) {
      query = query.eq('sube_id', filters.subeId)
    }

    const { data, error } = await query
    return { data, error }
  },

  // Get single document
  getById: async (id) => {
    const { data, error } = await supabase
      .from('belgeler')
      .select(`
        *,
        profiles!belgeler_yukleyen_kisi_fkey(full_name),
        subeler!belgeler_sube_id_fkey(sube_adi, sube_kodu)
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  // Create document
  create: async (belgeData) => {
    const { data, error } = await supabase
      .from('belgeler')
      .insert([belgeData])
      .select()
      .single()
    return { data, error }
  },

  // Update document
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('belgeler')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Delete document
  delete: async (id) => {
    const { error } = await supabase
      .from('belgeler')
      .delete()
      .eq('id', id)
    return { error }
  },

  // Upload document file
  uploadFile: async (file) => {
    const fileName = `belgeler/${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from('miyop-files')
      .upload(fileName, file)
    
    if (error) return { error }
    
    const { data: urlData } = supabase.storage
      .from('miyop-files')
      .getPublicUrl(fileName)
    
    return { data: urlData.publicUrl, error: null }
  }
}

// 5. PERSONEL HAREKETLERİ MODÜLÜ
export const personelHareketleri = {
  // Get all movements
  getAll: async (filters = {}) => {
    let query = supabase
      .from('personel_hareketleri')
      .select(`
        *,
        personel:profiles!personel_hareketleri_personel_id_fkey(full_name, email),
        subeler!personel_hareketleri_sube_id_fkey(sube_adi, sube_kodu),
        profiles!personel_hareketleri_created_by_fkey(full_name)
      `)
      .order('hareket_zamani', { ascending: false })

    if (filters.personelId) {
      query = query.eq('personel_id', filters.personelId)
    }
    if (filters.subeId) {
      query = query.eq('sube_id', filters.subeId)
    }
    if (filters.hareketTipi) {
      query = query.eq('hareket_tipi', filters.hareketTipi)
    }
    if (filters.startDate) {
      query = query.gte('hareket_zamani', filters.startDate)
    }
    if (filters.endDate) {
      query = query.lte('hareket_zamani', filters.endDate)
    }

    const { data, error } = await query
    return { data, error }
  },

  // Get single movement
  getById: async (id) => {
    const { data, error } = await supabase
      .from('personel_hareketleri')
      .select(`
        *,
        personel:profiles!personel_hareketleri_personel_id_fkey(full_name, email),
        subeler!personel_hareketleri_sube_id_fkey(sube_adi, sube_kodu),
        profiles!personel_hareketleri_created_by_fkey(full_name)
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  // Create movement
  create: async (hareketData) => {
    const { data, error } = await supabase
      .from('personel_hareketleri')
      .insert([hareketData])
      .select()
      .single()
    return { data, error }
  },

  // Update movement
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('personel_hareketleri')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Delete movement
  delete: async (id) => {
    const { error } = await supabase
      .from('personel_hareketleri')
      .delete()
      .eq('id', id)
    return { error }
  }
}

// 6. ŞUBELER MODÜLÜ
export const subeler = {
  // Get all branches
  getAll: async (filters = {}) => {
    let query = supabase
      .from('subeler')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive)
    }
    if (filters.search) {
      query = query.or(`sube_adi.ilike.%${filters.search}%,sube_kodu.ilike.%${filters.search}%`)
    }

    const { data, error } = await query
    return { data, error }
  },

  // Get single branch
  getById: async (id) => {
    const { data, error } = await supabase
      .from('subeler')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  // Create branch
  create: async (subeData) => {
    const { data, error } = await supabase
      .from('subeler')
      .insert([subeData])
      .select()
      .single()
    return { data, error }
  },

  // Update branch
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('subeler')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Delete branch
  delete: async (id) => {
    const { error } = await supabase
      .from('subeler')
      .delete()
      .eq('id', id)
    return { error }
  }
}

// Utility functions
export const utils = {
  // Format currency
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
  },

  // Format date
  formatDate: (date) => {
    return new Date(date).toLocaleDateString('tr-TR')
  },

  // Format datetime
  formatDateTime: (date) => {
    return new Date(date).toLocaleString('tr-TR')
  },

  // Validate file type
  validateFileType: (file, allowedTypes) => {
    return allowedTypes.includes(file.type)
  },

  // Validate file size (in MB)
  validateFileSize: (file, maxSizeMB) => {
    return file.size <= maxSizeMB * 1024 * 1024
  },

  // Sanitize input
  sanitizeInput: (input) => {
    return input.replace(/[<>]/g, '')
  }
}
