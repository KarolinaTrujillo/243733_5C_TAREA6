-- =========================================================
-- Archivo: roles.sql
-- Descripción:
-- Configuración de roles y permisos para la aplicación.
-- El usuario creado SOLO puede leer las VIEWS de reportes.
-- =========================================================

-- Crear rol para la aplicación
CREATE ROLE app_user LOGIN PASSWORD 'tarea6-karoPassword';

-- Quitar permisos por defecto
REVOKE ALL ON SCHEMA public FROM app_user;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM app_user;

-- Permitir uso del schema
GRANT USAGE ON SCHEMA public TO app_user;

-- Permitir SOLO SELECT sobre las VIEWS
GRANT SELECT ON vw_ventas_por_categoria TO app_user;
GRANT SELECT ON vw_productos_mas_vendidos TO app_user;
GRANT SELECT ON vw_resumen_usuarios TO app_user;
GRANT SELECT ON vw_ranking_productos TO app_user;
GRANT SELECT ON vw_ventas_por_orden TO app_user;
