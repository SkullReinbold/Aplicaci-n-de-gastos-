# Guía de Git (≥15 commits, ramas y PR)

```bash
git init && git branch -M main
git add README.md .gitignore && git commit -m "chore: README y .gitignore"
git add package.json app.json tsconfig.json .env.example && git commit -m "chore: configuración inicial Expo + TypeScript"
git remote add origin <URL_DEL_REPO> && git push -u origin main
git checkout -b develop && git push -u origin develop

# --- feature/login ---
git checkout -b feature/login
git add src/supabase.ts && git commit -m "feat(auth): cliente Supabase con persistencia de sesión"
git add src/validation.ts && git commit -m "feat(validation): esquemas zod para credenciales"
git add src/screens/LoginScreen.tsx && git commit -m "feat(auth): pantalla de login y registro"
git add App.tsx && git commit -m "feat(auth): puerta de autenticación y bloqueo biométrico"
git push -u origin feature/login
# En GitHub: PR feature/login -> develop. Pega la auto-revisión
# (checklist: validación de inputs, manejo de errores, sin secretos en el repo) y haz Merge.

# --- feature/gastos ---
git checkout develop && git pull && git checkout -b feature/gastos
git add src/types.ts && git commit -m "feat(model): tipos Gasto, Categoría y Presupuesto"
git add src/crypto.ts && git commit -m "feat(security): cifrado AES de notas con llave en SecureStore"
git add src/db.ts && git commit -m "feat(db): esquema SQLite y CRUD de gastos"
git add src/screens/ExpensesScreen.tsx && git commit -m "feat(ui): pantalla de gastos con alta, edición y baja"
git push -u origin feature/gastos   # PR -> develop

# --- feature/presupuesto-notificaciones ---
git checkout develop && git pull && git checkout -b feature/presupuesto-notificaciones
git add src/notifications.ts && git commit -m "feat(notif): alerta local al 80% del presupuesto"
git add src/screens/BudgetScreen.tsx && git commit -m "feat(ui): pantalla de presupuesto semanal"
git add src/sync.ts supabase/schema.sql && git commit -m "feat(sync): sincronización con Supabase"
git push -u origin feature/presupuesto-notificaciones   # PR -> develop

# --- release y hotfix ---
git checkout main && git merge develop && git push
git checkout -b hotfix/validacion-monto
# haz un arreglo real (ej. rechazar montos NaN) y:
git commit -am "fix: valida montos no numéricos" && git push -u origin hotfix/validacion-monto
# PR -> main; después merge de main hacia develop
git add docs && git commit -m "docs: reporte técnico y guía de Git"
```
Conteo: 2 + 4 + 4 + 3 + 1 (hotfix) + 1 (docs) = 15 commits.
