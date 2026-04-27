# Setup Supabase para CSS4Jobs Pro

## 1. Crear las tablas en Supabase

Ve a: https://app.supabase.com/project/rfpezchfdepmfrfveg/sql/new

Copia y ejecuta el siguiente SQL:

```sql
-- Crear tabla para guardar historial de claves Pro
CREATE TABLE IF NOT EXISTS pro_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  pro_key VARCHAR(200) NOT NULL UNIQUE,
  plan VARCHAR(50) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  used_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_pro_keys_email ON pro_keys(email);
CREATE INDEX IF NOT EXISTS idx_pro_keys_key ON pro_keys(pro_key);
CREATE INDEX IF NOT EXISTS idx_pro_keys_expires ON pro_keys(expires_at);
CREATE INDEX IF NOT EXISTS idx_pro_keys_status ON pro_keys(status);

-- Crear tabla para auditoría
CREATE TABLE IF NOT EXISTS pro_access_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  pro_key VARCHAR(200) NOT NULL,
  action VARCHAR(100),
  accessed_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (pro_key) REFERENCES pro_keys(pro_key)
);

CREATE INDEX IF NOT EXISTS idx_access_log_email ON pro_access_log(email);
CREATE INDEX IF NOT EXISTS idx_access_log_date ON pro_access_log(accessed_at);
```

## 2. Agregar env vars a Vercel

Ve a: https://vercel.com/careerstrategystudio/css4jobs/settings/environment-variables

Agrega estas variables (consulta el archivo .env.local en el servidor):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `ADMIN_SECRET`
- `KEY_SECRET`
- `EMAIL_FROM`

**Las credenciales ya están configuradas en el .env.local del servidor.**

## 3. Usar el admin panel

Una vez desplegado en Vercel, ir a:
`https://css4jobs.vercel.app/admin/generate-key`

Ingresar:
- Email del cliente
- Plan (monthly, quadrimestral, semestral)
- Click en "Generar Clave Pro"

¡La clave será generada y el cliente recibirá un email!
