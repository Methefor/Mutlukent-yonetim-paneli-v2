# MİYOP (Mutlukent İş Yönetim Paneli)

Next.js 14 + TypeScript + Tailwind + shadcn/ui (minimal primitives) + Supabase.

## Kurulum

1. Bağımlılıklar

```bash
npm install
```

2. Ortam değişkenleri

`.env` dosyası oluşturun:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

3. Geliştirme

```bash
npm run dev
```

## Modüller
- Satış & Finans (ciro, Z-raporu)
- Siparişler
- Bakım & Talepler
- Belge Arşivi
- İK & Personel
- Yönetici / Kullanıcılar

## RBAC
- `profiles.role` ile menüler ve veri erişimi kısıtlanır; detaylı politikalar `supabase/migrations/0001_init.sql` içindedir.