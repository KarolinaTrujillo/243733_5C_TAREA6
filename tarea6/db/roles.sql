-- 1. Crear el usuario de la aplicación de forma segura
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'app_user') THEN
    -- NOTA: Esta contraseña DEBE coincidir con la variable DB_PASSWORD de tu archivo .env
    CREATE ROLE app_user WITH LOGIN PASSWORD 'tarea6-karoPassword';
  END IF;
END $$;

-- 2. Limpieza de permisos (Hardening)
-- Revocamos permisos por defecto para que nadie entre si no está autorizado
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM app_user;

-- 3. Asignar permisos mínimos de uso
GRANT USAGE ON SCHEMA public TO app_user;

-- 4. Permitir SELECT en las vistas
-- PostgreSQL trata las vistas como tablas para efectos de permisos.
-- 'ALL TABLES' incluye las vistas creadas en reports_vw.sql
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_user;

-- 5. BLOQUEO EXPLÍCITO A TABLAS BASE
-- Para cumplir con el "Threat Model": la app solo debe leer reportes, no datos crudos.
REVOKE SELECT ON TABLE categorias, usuarios, productos, ordenes, orden_detalles FROM app_user;