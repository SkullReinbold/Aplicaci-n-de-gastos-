# Gastos Personales (MVP)
App móvil de gestión de gastos hecha con **React Native + Expo + TypeScript** y **Supabase** (Auth + Postgres con RLS).

## Requisitos
Node.js LTS, Android Studio con emulador (API 34) o Expo Go, y un proyecto de Supabase.

## Instalación
```bash
git clone https://github.com/SkullReinbold/Aplicaci-n-de-gastos-.git
cd Aplicaci-n-de-gastos-

npm install
cp .env.example .env      # completa con tus credenciales de Supabase
npx expo start --android
```
## Configuración de Supabase
1. Crea un proyecto en supabase.com.
2. En **SQL Editor** ejecuta el contenido de `supabase/schema.sql` (tabla + RLS).
3. En **Authentication > Providers** deja activo Email (puedes desactivar "Confirm email" para pruebas).
4. En **Project Settings > API** copia la *Project URL* y la *anon key* a tu `.env`.

## Características
- CRUD de gastos en SQLite local (Gasto, Categoría, Presupuesto relacionados)
- Login Supabase Auth + biometría (huella/Face ID)
- Foto de ticket con cámara (expo-image-picker)
- Sincronización con Supabase (upsert) con estados de carga/error
- Notificación local al superar 80% del presupuesto semanal
- Notas cifradas con AES-256 (llave en SecureStore); validación con zod
- Librerías extra: `zod`, `date-fns`, `aes-js`, `Intl` para moneda

## Flujo de ramas
`main` ← `develop` ← `feature/*`; `hotfix/*` sale de `main`.
## Instalar la app (APK)
Descarga e instala el APK de Android desde:
https://expo.dev/accounts/skullreinbold/projects/gastos-personales/builds/3592cbdf-3893-4e34-b885-8357ca89532e
