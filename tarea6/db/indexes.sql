-- =========================================================
-- Archivo: indexes.sql
-- Descripción:
-- Índices para optimizar consultas usadas por las VIEWS
-- del archivo reports_vw.sql.
-- Las views no pueden indexarse directamente, pero estos
-- índices ayudan a acelerar JOIN, GROUP BY y filtros.
-- =========================================================

-- Índice para JOIN y GROUP BY en productos por categoría
CREATE INDEX IF NOT EXISTS idx_productos_categoria_id
ON productos (categoria_id);

-- Índice para JOIN entre ordenes y usuarios
CREATE INDEX IF NOT EXISTS idx_ordenes_usuario_id
ON ordenes (usuario_id);

-- Índice para JOIN entre orden_detalles y ordenes
CREATE INDEX IF NOT EXISTS idx_orden_detalles_orden_id
ON orden_detalles (orden_id);

-- Índice para JOIN entre orden_detalles y productos
CREATE INDEX IF NOT EXISTS idx_orden_detalles_producto_id
ON orden_detalles (producto_id);

-- Índice para GROUP BY y ranking de productos
CREATE INDEX IF NOT EXISTS idx_productos_id_nombre
ON productos (id, nombre);

-- ============================================
-- VERIFICACIÓN DE USO DE ÍNDICES CON EXPLAIN
-- ============================================

-- Verificar uso de índice en vw_ventas_por_categoria
-- Debe mostrar uso de idx_productos_categoria_id
EXPLAIN
SELECT * FROM vw_ventas_por_categoria;

-- Verificar uso de índice en vw_productos_mas_vendidos
-- Debe mostrar uso de idx_orden_detalles_producto_id
EXPLAIN
SELECT * FROM vw_productos_mas_vendidos;

-- Verificar uso de índice en vw_resumen_usuarios
-- Debe mostrar uso de idx_ordenes_usuario_id
EXPLAIN
SELECT * FROM vw_resumen_usuarios;
