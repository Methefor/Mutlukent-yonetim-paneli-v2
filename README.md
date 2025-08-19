# MİYOP - Mutlukent İş Yönetim Paneli

Modern React tabanlı yönetim paneli uygulaması. ArchitectUI template'i kullanılarak geliştirilmiştir.

## 🚀 Özellikler

- **Modern React 18** - En güncel React özellikleri
- **Supabase Backend** - Güçlü ve ölçeklenebilir backend
- **Rol Bazlı Yetkilendirme** - Güvenli erişim kontrolü
- **Responsive Tasarım** - Tüm cihazlarda mükemmel görünüm
- **Modern UI/UX** - Kullanıcı dostu arayüz
- **TypeScript Desteği** - Tip güvenliği (opsiyonel)

## 📋 Gereksinimler

- Node.js 16+ 
- npm veya yarn
- Supabase hesabı

## 🛠️ Kurulum

1. **Projeyi klonlayın:**
```bash
git clone <repository-url>
cd mutlukent-miyop
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Environment değişkenlerini ayarlayın:**
```bash
cp .env.example .env.local
```

`.env.local` dosyasını düzenleyerek Supabase bilgilerinizi ekleyin:
```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Uygulamayı başlatın:**
```bash
npm start
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

## 🗄️ Supabase Kurulumu

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni proje oluşturun
3. SQL Editor'de aşağıdaki tabloları oluşturun:

### Profiles Tablosu
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) etkinleştirin
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politikalar
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
```

## 📁 Proje Yapısı

```
src/
├── components/          # React bileşenleri
│   ├── auth/           # Kimlik doğrulama bileşenleri
│   ├── dashboard/      # Dashboard bileşenleri
│   └── common/         # Ortak bileşenler
├── contexts/           # React Context'leri
├── lib/               # Yardımcı kütüphaneler
├── hooks/             # Custom React hooks
├── utils/             # Yardımcı fonksiyonlar
└── styles/            # CSS dosyaları
```

## 🔐 Kimlik Doğrulama

Sistem şu özellikleri destekler:
- Email/şifre ile giriş
- Rol bazlı yetkilendirme
- Oturum yönetimi
- Güvenli çıkış

## 🎨 Tasarım Sistemi

- **Renkler:** Modern gradient ve flat renkler
- **Tipografi:** Sistem fontları
- **Bileşenler:** Styled-components ile oluşturulmuş
- **Responsive:** Mobile-first yaklaşım

## 📱 Responsive Tasarım

- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🚀 Production Build

```bash
npm run build
```

Build dosyaları `build/` klasöründe oluşturulacaktır.

## 🧪 Test

```bash
npm test
```

## 📝 Lisans

Bu proje özel kullanım için geliştirilmiştir.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 İletişim

Proje Sahibi - [@mutlukent](https://github.com/mutlukent)

Proje Linki: [https://github.com/mutlukent/mutlukent-miyop](https://github.com/mutlukent/mutlukent-miyop)
