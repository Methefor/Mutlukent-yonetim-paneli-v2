-- MİYOP Database Schema
-- Supabase SQL Editor'de çalıştırın

-- ========================================
-- 1. PROFİLLER (Kullanıcı Profilleri)
-- ========================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user', 'viewer')),
  permissions TEXT[] DEFAULT '{}',
  sube_id UUID, -- Şube ilişkisi
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. ŞUBELER
-- ========================================
CREATE TABLE subeler (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sube_adi TEXT NOT NULL,
  sube_kodu VARCHAR(10) UNIQUE NOT NULL,
  adres TEXT,
  telefon TEXT,
  email TEXT,
  yetkili_kisi TEXT,
  yetkili_telefon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles tablosuna şube foreign key ekleme
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_sube 
  FOREIGN KEY (sube_id) REFERENCES subeler(id) ON DELETE SET NULL;

-- ========================================
-- 3. CİRO RAPORLARI (Satış Verileri)
-- ========================================
CREATE TABLE ciro_raporlari (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rapor_no VARCHAR(50) UNIQUE NOT NULL,
  sube_id UUID REFERENCES subeler(id) ON DELETE CASCADE,
  tarih DATE NOT NULL,
  toplam_ciro DECIMAL(12,2) NOT NULL,
  nakit_ciro DECIMAL(12,2) DEFAULT 0,
  kredi_karti_ciro DECIMAL(12,2) DEFAULT 0,
  diger_odeme_ciro DECIMAL(12,2) DEFAULT 0,
  z_raporu_url TEXT,
  aciklama TEXT,
  durum TEXT DEFAULT 'aktif' CHECK (durum IN ('aktif', 'pasif', 'silindi')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 4. SİPARİŞLER
-- ========================================
CREATE TABLE siparisler (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  siparis_no VARCHAR(50) UNIQUE NOT NULL,
  sube_id UUID REFERENCES subeler(id) ON DELETE CASCADE,
  musteri_adi TEXT NOT NULL,
  musteri_telefon TEXT,
  musteri_email TEXT,
  toplam_tutar DECIMAL(10,2) NOT NULL,
  durum TEXT DEFAULT 'beklemede' CHECK (durum IN ('beklemede', 'onaylandi', 'hazirlaniyor', 'hazir', 'teslim_edildi', 'iptal_edildi')),
  teslim_tarihi TIMESTAMP WITH TIME ZONE,
  notlar TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sipariş Detayları
CREATE TABLE siparis_detaylari (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  siparis_id UUID REFERENCES siparisler(id) ON DELETE CASCADE,
  urun_adi TEXT NOT NULL,
  miktar INTEGER NOT NULL,
  birim_fiyat DECIMAL(10,2) NOT NULL,
  toplam_fiyat DECIMAL(10,2) NOT NULL,
  notlar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 5. ARIZA TALEPLERİ
-- ========================================
CREATE TABLE ariza_talepleri (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  talep_no VARCHAR(50) UNIQUE NOT NULL,
  sube_id UUID REFERENCES subeler(id) ON DELETE CASCADE,
  kategori TEXT NOT NULL CHECK (kategori IN ('teknik', 'hizmet', 'fatura', 'diger')),
  oncelik TEXT DEFAULT 'orta' CHECK (oncelik IN ('dusuk', 'orta', 'yuksek', 'acil')),
  baslik TEXT NOT NULL,
  aciklama TEXT NOT NULL,
  durum TEXT DEFAULT 'acik' CHECK (durum IN ('acik', 'islemde', 'cozuldu', 'kapali')),
  atanan_kisi UUID REFERENCES auth.users(id),
  cozum_aciklamasi TEXT,
  cozum_tarihi TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Arıza Talebi Ekleri
CREATE TABLE ariza_talep_ekleri (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  talep_id UUID REFERENCES ariza_talepleri(id) ON DELETE CASCADE,
  dosya_adi TEXT NOT NULL,
  dosya_url TEXT NOT NULL,
  dosya_tipi TEXT,
  dosya_boyutu INTEGER,
  yukleyen_kisi UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 6. BELGELER
-- ========================================
CREATE TABLE belgeler (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  baslik TEXT NOT NULL,
  aciklama TEXT,
  dosya_adi TEXT NOT NULL,
  dosya_url TEXT NOT NULL,
  dosya_tipi TEXT,
  dosya_boyutu INTEGER,
  kategori TEXT NOT NULL CHECK (kategori IN ('fatura', 'makbuz', 'sozlesme', 'rapor', 'diger')),
  etiketler TEXT[],
  sube_id UUID REFERENCES subeler(id) ON DELETE CASCADE,
  yukleyen_kisi UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 7. PERSONEL HAREKETLERİ
-- ========================================
CREATE TABLE personel_hareketleri (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  personel_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sube_id UUID REFERENCES subeler(id) ON DELETE CASCADE,
  hareket_tipi TEXT NOT NULL CHECK (hareket_tipi IN ('giris', 'cikis', 'mola_baslangic', 'mola_bitis')),
  hareket_zamani TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notlar TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- RLS (Row Level Security) ETKİNLEŞTİRME
-- ========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subeler ENABLE ROW LEVEL SECURITY;
ALTER TABLE ciro_raporlari ENABLE ROW LEVEL SECURITY;
ALTER TABLE siparisler ENABLE ROW LEVEL SECURITY;
ALTER TABLE siparis_detaylari ENABLE ROW LEVEL SECURITY;
ALTER TABLE ariza_talepleri ENABLE ROW LEVEL SECURITY;
ALTER TABLE ariza_talep_ekleri ENABLE ROW LEVEL SECURITY;
ALTER TABLE belgeler ENABLE ROW LEVEL SECURITY;
ALTER TABLE personel_hareketleri ENABLE ROW LEVEL SECURITY;

-- ========================================
-- RLS POLİTİKALARI
-- ========================================

-- PROFİLLER POLİTİKALARI
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ŞUBELER POLİTİKALARI
CREATE POLICY "Users can view subeler" ON subeler
  FOR SELECT USING (true);

CREATE POLICY "Managers and admins can insert subeler" ON subeler
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Managers and admins can update subeler" ON subeler
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can delete subeler" ON subeler
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- CİRO RAPORLARI POLİTİKALARI
CREATE POLICY "Users can view ciro_raporlari" ON ciro_raporlari
  FOR SELECT USING (true);

CREATE POLICY "Users can insert ciro_raporlari" ON ciro_raporlari
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own ciro_raporlari" ON ciro_raporlari
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can delete ciro_raporlari" ON ciro_raporlari
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- SİPARİŞLER POLİTİKALARI
CREATE POLICY "Users can view siparisler" ON siparisler
  FOR SELECT USING (true);

CREATE POLICY "Users can insert siparisler" ON siparisler
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own siparisler" ON siparisler
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can delete siparisler" ON siparisler
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- SİPARİŞ DETAYLARI POLİTİKALARI
CREATE POLICY "Users can view siparis_detaylari" ON siparis_detaylari
  FOR SELECT USING (true);

CREATE POLICY "Users can insert siparis_detaylari" ON siparis_detaylari
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update siparis_detaylari" ON siparis_detaylari
  FOR UPDATE USING (true);

-- ARIZA TALEPLERİ POLİTİKALARI
CREATE POLICY "Users can view ariza_talepleri" ON ariza_talepleri
  FOR SELECT USING (true);

CREATE POLICY "Users can insert ariza_talepleri" ON ariza_talepleri
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update ariza_talepleri" ON ariza_talepleri
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    auth.uid() = atanan_kisi OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can delete ariza_talepleri" ON ariza_talepleri
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ARIZA TALEP EKLERİ POLİTİKALARI
CREATE POLICY "Users can view ariza_talep_ekleri" ON ariza_talep_ekleri
  FOR SELECT USING (true);

CREATE POLICY "Users can insert ariza_talep_ekleri" ON ariza_talep_ekleri
  FOR INSERT WITH CHECK (auth.uid() = yukleyen_kisi);

CREATE POLICY "Users can delete own ariza_talep_ekleri" ON ariza_talep_ekleri
  FOR DELETE USING (
    auth.uid() = yukleyen_kisi OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- BELGELER POLİTİKALARI
CREATE POLICY "Users can view belgeler" ON belgeler
  FOR SELECT USING (true);

CREATE POLICY "Users can insert belgeler" ON belgeler
  FOR INSERT WITH CHECK (auth.uid() = yukleyen_kisi);

CREATE POLICY "Users can update own belgeler" ON belgeler
  FOR UPDATE USING (
    auth.uid() = yukleyen_kisi OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can delete own belgeler" ON belgeler
  FOR DELETE USING (
    auth.uid() = yukleyen_kisi OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- PERSONEL HAREKETLERİ POLİTİKALARI
CREATE POLICY "Users can view personel_hareketleri" ON personel_hareketleri
  FOR SELECT USING (true);

CREATE POLICY "Users can insert personel_hareketleri" ON personel_hareketleri
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own personel_hareketleri" ON personel_hareketleri
  FOR UPDATE USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can delete personel_hareketleri" ON personel_hareketleri
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- İNDEKSLER (Performans için)
-- ========================================
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_sube_id ON profiles(sube_id);
CREATE INDEX idx_profiles_email ON profiles(email);

CREATE INDEX idx_subeler_sube_kodu ON subeler(sube_kodu);
CREATE INDEX idx_subeler_is_active ON subeler(is_active);

CREATE INDEX idx_ciro_raporlari_tarih ON ciro_raporlari(tarih);
CREATE INDEX idx_ciro_raporlari_sube_id ON ciro_raporlari(sube_id);
CREATE INDEX idx_ciro_raporlari_created_by ON ciro_raporlari(created_by);

CREATE INDEX idx_siparisler_siparis_no ON siparisler(siparis_no);
CREATE INDEX idx_siparisler_sube_id ON siparisler(sube_id);
CREATE INDEX idx_siparisler_durum ON siparisler(durum);
CREATE INDEX idx_siparisler_created_at ON siparisler(created_at);

CREATE INDEX idx_siparis_detaylari_siparis_id ON siparis_detaylari(siparis_id);

CREATE INDEX idx_ariza_talepleri_talep_no ON ariza_talepleri(talep_no);
CREATE INDEX idx_ariza_talepleri_sube_id ON ariza_talepleri(sube_id);
CREATE INDEX idx_ariza_talepleri_durum ON ariza_talepleri(durum);
CREATE INDEX idx_ariza_talepleri_kategori ON ariza_talepleri(kategori);
CREATE INDEX idx_ariza_talepleri_atanan_kisi ON ariza_talepleri(atanan_kisi);

CREATE INDEX idx_ariza_talep_ekleri_talep_id ON ariza_talep_ekleri(talep_id);

CREATE INDEX idx_belgeler_kategori ON belgeler(kategori);
CREATE INDEX idx_belgeler_sube_id ON belgeler(sube_id);
CREATE INDEX idx_belgeler_created_at ON belgeler(created_at);

CREATE INDEX idx_personel_hareketleri_personel_id ON personel_hareketleri(personel_id);
CREATE INDEX idx_personel_hareketleri_sube_id ON personel_hareketleri(sube_id);
CREATE INDEX idx_personel_hareketleri_hareket_zamani ON personel_hareketleri(hareket_zamani);
CREATE INDEX idx_personel_hareketleri_hareket_tipi ON personel_hareketleri(hareket_tipi);

-- ========================================
-- FONKSİYONLAR
-- ========================================

-- Otomatik updated_at güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Otomatik rapor numarası oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION generate_rapor_no()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.rapor_no IS NULL THEN
        NEW.rapor_no := 'RAP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                       LPAD(CAST(nextval('rapor_seq') AS TEXT), 4, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Otomatik sipariş numarası oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION generate_siparis_no()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.siparis_no IS NULL THEN
        NEW.siparis_no := 'SIP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                         LPAD(CAST(nextval('siparis_seq') AS TEXT), 4, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Otomatik talep numarası oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION generate_talep_no()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.talep_no IS NULL THEN
        NEW.talep_no := 'TAL-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                       LPAD(CAST(nextval('talep_seq') AS TEXT), 4, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ========================================
-- SEQUENCE'LER
-- ========================================
CREATE SEQUENCE IF NOT EXISTS rapor_seq START 1;
CREATE SEQUENCE IF NOT EXISTS siparis_seq START 1;
CREATE SEQUENCE IF NOT EXISTS talep_seq START 1;

-- ========================================
-- TRİGGER'LAR
-- ========================================

-- Updated_at trigger'ları
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subeler_updated_at BEFORE UPDATE ON subeler FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ciro_raporlari_updated_at BEFORE UPDATE ON ciro_raporlari FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_siparisler_updated_at BEFORE UPDATE ON siparisler FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ariza_talepleri_updated_at BEFORE UPDATE ON ariza_talepleri FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_belgeler_updated_at BEFORE UPDATE ON belgeler FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Otomatik numara oluşturma trigger'ları
CREATE TRIGGER generate_ciro_rapor_no BEFORE INSERT ON ciro_raporlari FOR EACH ROW EXECUTE FUNCTION generate_rapor_no();
CREATE TRIGGER generate_siparis_no_trigger BEFORE INSERT ON siparisler FOR EACH ROW EXECUTE FUNCTION generate_siparis_no();
CREATE TRIGGER generate_talep_no_trigger BEFORE INSERT ON ariza_talepleri FOR EACH ROW EXECUTE FUNCTION generate_talep_no();

-- ========================================
-- VARSAYILAN VERİLER
-- ========================================

-- Varsayılan şube ekleme
INSERT INTO subeler (sube_adi, sube_kodu, adres, telefon, email, yetkili_kisi, yetkili_telefon)
VALUES ('Ana Şube', 'AS001', 'Merkez Adres', '0212 123 45 67', 'anasube@mutlukent.com', 'Şube Müdürü', '0532 123 45 67')
ON CONFLICT (sube_kodu) DO NOTHING;

-- ========================================
-- YARDIMCI FONKSİYONLAR
-- ========================================

-- Kullanıcının şubesini getiren fonksiyon
CREATE OR REPLACE FUNCTION get_user_sube_id(user_uuid UUID)
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT sube_id FROM profiles WHERE id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Şube bazlı ciro toplamı getiren fonksiyon
CREATE OR REPLACE FUNCTION get_sube_ciro_toplami(sube_uuid UUID, baslangic_tarih DATE, bitis_tarih DATE)
RETURNS DECIMAL AS $$
BEGIN
    RETURN (
        SELECT COALESCE(SUM(toplam_ciro), 0)
        FROM ciro_raporlari
        WHERE sube_id = sube_uuid
        AND tarih BETWEEN baslangic_tarih AND bitis_tarih
        AND durum = 'aktif'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kullanıcının yetkilerini kontrol eden fonksiyon
CREATE OR REPLACE FUNCTION has_permission(user_uuid UUID, required_permission TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT 
            role = 'admin' OR 
            required_permission = ANY(permissions)
        FROM profiles 
        WHERE id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
