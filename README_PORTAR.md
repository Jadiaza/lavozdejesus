# Portar LaVozFy a "La Voz de Jesús" existente

## 1. Copiar tal cual (archivos NUEVOS)
- `src/features/lavozfy/`  → carpeta completa
- `src/integrations/supabase/`  → SOLO si tu app no tiene Cloud activo
- `supabase/config.toml`  → SOLO si tu app no lo tiene
- `.env.example` → copia las variables VITE_SUPABASE_* a tu `.env` si no existen

## 2. Merge manual (archivos que YA existen en tu app)
Los originales están en `_merge/` como referencia. NO reemplaces, integra:

### _merge/App.tsx
Añade en tu App.tsx:
- Imports de MusicaLayout, Home, Simple, Auth
- El bloque de <Route> "/musica/*" y "/musica/login|registro|reset-password"

### _merge/index.css
Añade el bloque de tokens `--lv-*`, clase `.lavozfy` y `.lv-scroll`.

### _merge/main.tsx
Añade los imports de `@fontsource/inter/{400,500,600,700}.css`.

### _merge/QuickAccess.tsx y BottomNav.tsx
Añade el item "Música" → /musica (icono Music2 de lucide-react).

### _merge/package.json
Añade a dependencies:
  "zustand": "^4.5.0",
  "@fontsource/inter": "^5.0.0",
  "@supabase/supabase-js": "^2.45.0"   // solo si falta
Luego: bun install

## 3. Verificar
- Ir a /musica → debe cargar el módulo
- Ir a /musica/login → auth básica
