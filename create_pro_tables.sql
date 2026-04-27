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
