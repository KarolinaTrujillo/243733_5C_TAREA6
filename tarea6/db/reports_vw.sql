-- =========================================================
-- REPORTE 1: Ventas por Categoría
-- =========================================================
-- Qué devuelve: Total de ventas agrupadas por cada categoría de productos
-- Grain: Cada fila representa una categoría única con sus ventas totales
-- Métricas: total_vendido (suma del monto de todas las ventas), descripcion (descripción de la categoría o 'Sin descripción' si es NULL)
-- Por qué usa GROUP BY: Para sumar las ventas de todos los productos que pertenecen a la misma categoría
-- VERIFY:
-- SELECT * FROM vw_ventas_por_categoria ORDER BY total_vendido DESC;
-- SELECT COUNT(*) FROM vw_ventas_por_categoria; -- Debe devolver el número de categorías
-- =========================================================

CREATE OR REPLACE VIEW vw_ventas_por_categoria AS
SELECT
    c.id AS categoria_id,
    c.nombre AS categoria,
    SUM(od.cantidad * od.precio_unitario) AS total_vendido,
    COALESCE(c.descripcion, 'Sin descripción') AS descripcion
FROM orden_detalles od
JOIN productos p ON od.producto_id = p.id
JOIN categorias c ON p.categoria_id = c.id
GROUP BY c.id, c.nombre, c.descripcion;


-- =========================================================
-- REPORTE 2: Productos Más Vendidos
-- =========================================================
-- Qué devuelve: Lista de productos que han vendido más de 5 unidades
-- Grain: Cada fila representa un producto individual que cumple con el filtro
-- Métricas: total_vendido (cantidad total de unidades vendidas del producto), stock_actual (stock disponible o 0 si es NULL)
-- Por qué usa GROUP BY / HAVING: GROUP BY agrupa las ventas por producto, HAVING filtra solo los que vendieron más de 5 unidades
-- VERIFY:
-- SELECT * FROM vw_productos_mas_vendidos ORDER BY total_vendido DESC;
-- SELECT COUNT(*) FROM vw_productos_mas_vendidos; -- Productos que vendieron >5 unidades
-- =========================================================

CREATE OR REPLACE VIEW vw_productos_mas_vendidos AS
SELECT
    p.id AS producto_id,
    p.nombre AS producto,
    SUM(od.cantidad) AS total_vendido,
    COALESCE(p.stock, 0) AS stock_actual
FROM orden_detalles od
JOIN productos p ON od.producto_id = p.id
GROUP BY p.id, p.nombre, p.stock
HAVING SUM(od.cantidad) > 5;


-- =========================================================
-- REPORTE 3: Resumen por Usuario
-- =========================================================
-- Qué devuelve: Resumen de actividad y gasto de cada usuario en la tienda
-- Grain: Cada fila representa un usuario único con su historial de compras
-- Métricas: total_ordenes (número de órdenes), total_gastado (suma del dinero gastado)
-- Por qué usa GROUP BY: Para consolidar todas las órdenes y compras de cada usuario en una sola fila
-- VERIFY:
-- SELECT * FROM vw_resumen_usuarios ORDER BY total_gastado DESC;
-- SELECT tipo_cliente, COUNT(*) FROM vw_resumen_usuarios GROUP BY tipo_cliente; -- Distribución de clientes
-- =========================================================

CREATE OR REPLACE VIEW vw_resumen_usuarios AS
SELECT
    u.id AS usuario_id,
    u.nombre AS usuario,
    COUNT(o.id) AS total_ordenes,
    SUM(od.cantidad * od.precio_unitario) AS total_gastado,
    CASE
        WHEN COUNT(o.id) > 3 THEN 'Cliente frecuente'
        ELSE 'Cliente ocasional'
    END AS tipo_cliente
FROM usuarios u
JOIN ordenes o ON u.id = o.usuario_id
JOIN orden_detalles od ON o.id = od.orden_id
GROUP BY u.id, u.nombre;


-- =========================================================
-- REPORTE 4: Ranking de Productos por Ventas
-- =========================================================
-- Qué devuelve: Lista de productos ordenados por sus ventas totales con un ranking
-- Grain: Cada fila representa un producto con su posición en el ranking de ventas
-- Métricas: total_vendido (monto total de ventas), ranking (posición del 1 al N)
-- Por qué usa GROUP BY: Para sumar todas las ventas de cada producto antes de calcular el ranking con RANK()
-- VERIFY:
-- SELECT * FROM vw_ranking_productos ORDER BY ranking;
-- SELECT nivel_venta, COUNT(*) FROM vw_ranking_productos GROUP BY nivel_venta; -- Productos por nivel
-- =========================================================

CREATE OR REPLACE VIEW vw_ranking_productos AS
SELECT
    p.id AS producto_id,
    p.nombre AS producto,
    SUM(od.cantidad * od.precio_unitario) AS total_vendido,
    RANK() OVER (ORDER BY SUM(od.cantidad * od.precio_unitario) DESC) AS ranking,
    CASE
        WHEN SUM(od.cantidad * od.precio_unitario) > 1000 THEN 'Alta venta'
        ELSE 'Venta normal'
    END AS nivel_venta
FROM orden_detalles od
JOIN productos p ON od.producto_id = p.id
GROUP BY p.id, p.nombre;



-- =========================================================
-- REPORTE 5: Ventas por Orden (CTE)
-- =========================================================
-- Qué devuelve: Órdenes que tienen un total mayor a $100
-- Grain: Cada fila representa una orden individual que cumple con el filtro de monto
-- Métricas: total_orden (monto total de la orden), cantidad_productos (número de productos en la orden)
-- Por qué usa GROUP BY / HAVING: GROUP BY suma los productos de cada orden, HAVING filtra las órdenes mayores a $100. Usa CTE (WITH) para organizar mejor la consulta
-- VERIFY:
-- SELECT * FROM vw_ventas_por_orden ORDER BY total_orden DESC;
-- SELECT COUNT(*), AVG(total_orden) FROM vw_ventas_por_orden; -- Número de órdenes y promedio
-- =========================================================

CREATE OR REPLACE VIEW vw_ventas_por_orden AS
WITH totales_orden AS (
    SELECT
        o.id AS orden_id,
        SUM(od.cantidad * od.precio_unitario) AS total_orden,
        COUNT(od.id) AS productos_count
    FROM ordenes o
    JOIN orden_detalles od ON o.id = od.orden_id
    GROUP BY o.id
    HAVING SUM(od.cantidad * od.precio_unitario) > 100
)
SELECT
    orden_id,
    total_orden,
    COALESCE(productos_count, 0) AS cantidad_productos
FROM totales_orden;


