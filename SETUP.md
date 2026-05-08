# LUMIO — Guia de configuracion paso a paso

## Tus 5 codigos de desarrollador

Estos codigos dan acceso PREMIUM gratuito permanente. Cada uno solo se puede vincular a UN correo:

| Codigo | Estado |
|--------|--------|
| `LUMIO-DEV-7X9K2` | Libre |
| `LUMIO-DEV-M4P8N` | Libre |
| `LUMIO-DEV-Q2W5J` | Libre |
| `LUMIO-DEV-R6T3Y` | Libre |
| `LUMIO-DEV-V1H8S` | Libre |

---

## PASO 1: Crear cuenta en GitHub

1. Ve a https://github.com/signup
2. Crea una cuenta con tu email
3. Confirma el email

## PASO 2: Crear cuenta en Supabase

1. Ve a https://supabase.com
2. Click en "Start your project" → inicia sesion con GitHub
3. Click "New project"
   - Organization: tu nombre
   - Project name: `lumio`
   - Database Password: genera una segura y GUARDALA
   - Region: selecciona la mas cercana (ej: Frankfurt para Europa)
4. Espera a que se cree (~2 minutos)

### Configurar la base de datos

5. En el menu izquierdo click "SQL Editor"
6. Abre el archivo `supabase/migrations/001_initial.sql` de este proyecto
7. Copia TODO el contenido y pegalo en el SQL Editor
8. Click "Run" (boton verde)
9. Deberia decir "Success"

### Obtener las claves

10. Ve a Settings → API (menu izquierdo)
11. Copia estos valores:
    - **Project URL** → es tu `NEXT_PUBLIC_SUPABASE_URL`
    - **anon public** key → es tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - **service_role** key → es tu `SUPABASE_SERVICE_ROLE_KEY` (NUNCA la compartas)

### Configurar autenticacion

12. Ve a Authentication → Providers
13. Verifica que "Email" esta habilitado
14. En Authentication → URL Configuration:
    - Site URL: `http://localhost:3000` (cambiar luego al dominio de Vercel)
    - Redirect URLs: agrega `http://localhost:3000/auth/callback`

## PASO 3: Crear cuenta en Stripe

1. Ve a https://dashboard.stripe.com/register
2. Crea tu cuenta
3. NO necesitas activar pagos reales todavia — puedes usar modo test

### Obtener las claves

4. En el Dashboard de Stripe, click el toggle "Test mode" (arriba a la derecha)
5. Ve a Developers → API keys
6. Copia:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`

### Configurar webhook (despues de desplegar)

7. Ve a Developers → Webhooks → Add endpoint
8. URL: `https://tu-app.vercel.app/api/stripe/webhook`
9. Eventos a escuchar:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
10. Copia el **Signing secret** → `STRIPE_WEBHOOK_SECRET`

## PASO 4: Configurar variables de entorno

Abre el archivo `.env.local` en la carpeta `lumio/` y rellena con tus claves:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## PASO 5: Probar en local

Abre una terminal en la carpeta `lumio/` y ejecuta:

```bash
npm run dev
```

Abre http://localhost:3000 en tu navegador.

## PASO 6: Subir a GitHub

```bash
cd lumio
git init
git add .
git commit -m "Initial Lumio app"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/lumio.git
git push -u origin main
```

(Primero crea un repositorio vacio en GitHub llamado `lumio`)

## PASO 7: Desplegar en Vercel

1. Ve a https://vercel.com → inicia sesion con GitHub
2. Click "Import Project" → selecciona el repo `lumio`
3. En "Environment Variables", agrega TODAS las variables de `.env.local`
   - Importante: cambia `NEXT_PUBLIC_APP_URL` a `https://lumio-xxx.vercel.app` (la URL que Vercel te asigne)
4. Click "Deploy"
5. Espera ~2 minutos

### Despues del despliegue

6. Copia la URL de tu app (ej: `https://lumio-xxx.vercel.app`)
7. Ve a Supabase → Authentication → URL Configuration:
   - Cambia Site URL a tu URL de Vercel
   - Agrega `https://lumio-xxx.vercel.app/auth/callback` a Redirect URLs
8. Configura el webhook de Stripe con la URL de Vercel (Paso 3.7)

## PASO 8: Instalar en tu telefono

### iPhone (Safari)
1. Abre tu URL de Vercel en Safari
2. Toca el boton de compartir (cuadrado con flecha)
3. Scroll hacia abajo y toca "Anadir a pantalla de inicio"
4. Toca "Anadir"

### Android (Chrome)
1. Abre tu URL de Vercel en Chrome
2. Toca el menu (tres puntos arriba a la derecha)
3. Toca "Instalar aplicacion" o "Anadir a pantalla de inicio"
4. Toca "Instalar"

La app se abrira como una app nativa, sin barra de navegador.

---

## Usar un codigo de desarrollador

1. Abre la app
2. Crea una cuenta con email y contrasena
3. Cierra sesion
4. Inicia sesion de nuevo, pero esta vez:
   - Introduce tu email y contrasena
   - En el campo "CODIGO DESARROLLADOR", escribe uno de los 5 codigos
   - Click "Entrar"
5. El codigo queda vinculado permanentemente a tu email
6. Tienes acceso Premium sin pagar

---

## Notas importantes

- Los datos actualmente son de ejemplo (mock data). En futuras actualizaciones se conectaran con la base de datos para persistencia real.
- El modo test de Stripe no cobra dinero real. Usa la tarjeta `4242 4242 4242 4242` con cualquier fecha futura y CVC.
- Para pasar a produccion con Stripe, activa tu cuenta y cambia las claves test por las de produccion.
