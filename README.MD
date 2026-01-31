# Tarea 6: Lab Reportes: Next.js Reports Dashboard (PostgreSQL + Views + Docker Compose)

## INFORMACIÓN DEL PROYECTO

- **Materia:** Base de Datos Avanzada
- **Tarea:** 6 - Lab Reportes
- **Estudiante:** Karolina Guadalupe Ramírez Trujillo
- **Matrícula:** 243733
- **Grupo:** 5C
- **Fecha:** 31 de Enero del 2026

## CÓMO LEVANTAR EL PROYECTO

Para correr todo el proyecto solo necesitas tener Docker instalado y ejecutar este comando en la terminal:

```bash
docker compose up --build
```

Lo que hace este comando es:
- Levanta PostgreSQL con la base de datos
- Crea todas las tablas automáticamente
- Inserta los datos de prueba
- Crea las vistas y los índices
- Levanta la aplicación Next.js en **http://localhost:3000**

Si ya se corrió el proyecto antes y se quiere empezar de cero:

```bash
docker compose down -v
docker compose up --build
```

---

## TECNOLOGÍAS USADAS

### 1. **PostgreSQL 16** 
Es la base de datos. 

### 2. **Next.js 16**
Es el framework de frontend.

### 3. **Docker & Docker Compose**
Docker permite empaquetar todo el proyecto (base de datos + aplicación) en contenedores. Así no se tiene que instalar PostgreSQL manualmente ni configurar nada complicado. Con Docker Compose, se levanta todo con un solo comando.

### 4. **Node.js 20**
Es el runtime que usa Next.js para ejecutarse.

---

## ESTRUCTURA DEL PROYECTO

```
📦 243733_5C_TAREA6
├── 📂 tarea6/
│   └── 📂 db/                    # Scripts de base de datos
│       ├── schema.sql            # Definición de tablas
│       ├── seed.sql              # Datos de prueba
│       ├── migrate.sql           # Migraciones
│       ├── reports_vw.sql        # Vistas de reportes
│       ├── indexes.sql           # Índices para optimización
│       └── roles.sql             # Roles y permisos
│
├── 📂 tarea6-karo/               # Aplicación Next.js
│   ├── 📂 src/
│   │   ├── 📂 app/
│   │   │   ├── 📂 reports/       # Páginas de reportes
│   │   │   │   ├── 1/            # Reporte 1: Ventas por categoría
│   │   │   │   ├── 2/            # Reporte 2: Productos más vendidos
│   │   │   │   ├── 3/            # Reporte 3: Resumen de usuarios
│   │   │   │   ├── 4/            # Reporte 4: Ranking de productos
│   │   │   │   └── 5/            # Reporte 5: Ventas por orden
│   │   │   └── page.tsx          # Página principal
│   │   └── 📂 lib/
│   │       └── db.ts             # Conexión a la base de datos
│   └── dockerfile                # Configuración del contenedor
│
├── docker-compose.yml            # Orquestación de servicios
└── README.MD                     # Este archivo 
```

**¿Cómo funciona?**
1. Los archivos en `tarea6/db/` se ejecutan automáticamente cuando se levanta PostgreSQL
2. Primero crea las tablas (`schema.sql`)
3. Luego inserta datos de prueba (`seed.sql`)
4. Después crea las vistas para reportes (`reports_vw.sql`)
5. Finalmente crea los índices para optimizar (`indexes.sql`)
6. La aplicación Next.js se conecta a la base de datos y muestra los reportes

---

## ¿QUÉ SON LAS VISTAS (VIEWS)?

Las vistas son como consultas SQL guardadas. En lugar de escribir consultas largas cada vez que se quiere ver un reporte, se crea una vista y solo se hace `SELECT * FROM nombre_vista`.

**Las 5 vistas:**
1. `vw_ventas_por_categoria` - Cuánto se vendió de cada categoría
2. `vw_productos_mas_vendidos` - Qué productos se venden más
3. `vw_resumen_usuarios` - Cuántas órdenes y cuánto gastó cada usuario
4. `vw_ranking_productos` - Ranking de productos por ventas
5. `vw_ventas_por_orden` - Total de cada orden

---

## ¿POR QUÉ SE NECESITAN LOS ÍNDICES?

las vistas usan `JOIN` (unir tablas) y `GROUP BY` (agrupar datos), y sin índices, PostgreSQL tiene que revisar **TODAS** las filas de las tablas, lo cual es super lento.

Los índices son como el índice de un libro. En lugar de leer todo el libro para encontrar un tema, se va al índice y dice en qué página está. Así funcionan los índices en las bases de datos.

---

## ÍNDICES CREADOS (Análisis Detallado)

### 1. `idx_productos_categoria_id`

**Definición:**
```sql
CREATE INDEX idx_productos_categoria_id
ON productos (categoria_id);
```

**¿Para qué sirve?**

Este índice es clave para la vista `vw_ventas_por_categoria`. Cuando la vista hace el JOIN entre `productos` y `categorias`, sin este índice PostgreSQL tendría que buscar la categoría de cada producto revisando toda la tabla. Con el índice, va directo a los productos de cada categoría.

**Ejemplo práctico:**
- Sin índice: "Busca todos los productos y ve cuál pertenece a la categoría 1" (lento)
- Con índice: "Dame todos los productos con `categoria_id = 1`" (rápido)

**Operaciones que optimiza:**
- **JOIN entre productos y categorías**: El índice permite encontrar rápidamente todos los productos de una categoría específica
- **GROUP BY categoría**: Al agrupar por categoría, el índice ya tiene los datos organizados, así que es más eficiente
- **Filtros WHERE**: Si algún día queremos filtrar por categoría, el índice lo hace instantáneo

**Vista que lo usa:** `vw_ventas_por_categoria`

---

### 2. `idx_ordenes_usuario_id`

**Definición:**
```sql
CREATE INDEX idx_ordenes_usuario_id
ON ordenes (usuario_id);
```

**¿Para qué sirve?**

Este índice es fundamental para `vw_resumen_usuarios`. Cuando queremos saber cuántas órdenes tiene cada usuario y cuánto ha gastado, necesitamos encontrar todas las órdenes de cada usuario rápidamente.

**Ejemplo práctico:**
- Sin índice: Revisa las 1000 órdenes una por una para ver cuáles son del usuario 2 (súper lento)
- Con índice: "Dame todas las órdenes donde `usuario_id = 2`" (instantáneo)

**Operaciones que optimiza:**
- **JOIN entre ordenes y usuarios**: Encuentra todas las órdenes de un usuario específico sin revisar toda la tabla
- **GROUP BY usuario**: Agrupa las órdenes por usuario de forma eficiente
- **COUNT() y SUM()**: Al contar órdenes o sumar totales por usuario, el índice acelera el acceso a los datos
- **Análisis por cliente**: Facilita identificar clientes frecuentes vs ocasionales

**Vista que lo usa:** `vw_resumen_usuarios`

---

### 3. `idx_orden_detalles_orden_id`

**Definición:**
```sql
CREATE INDEX idx_orden_detalles_orden_id
ON orden_detalles (orden_id);
```

**¿Para qué sirve?**

Este índice es esencial cuando queremos ver los detalles de cada orden. Cada orden puede tener múltiples productos (detalles), y necesitamos encontrarlos rápido para calcular el total de la orden.

**Ejemplo práctico:**
Suponiendo que una orden tiene 10 productos diferentes:
- Sin índice: Busca en toda la tabla `orden_detalles` (que puede tener miles de registros) para encontrar esos 10 productos
- Con índice: Va directo a los 10 detalles de esa orden

**Operaciones que optimiza:**
- **JOIN entre ordenes y orden_detalles**: Encuentra todos los productos de una orden específica instantáneamente
- **GROUP BY orden**: Agrupa los detalles por orden para calcular totales
- **SUM() de subtotales**: Suma rápidamente el total de cada orden
- **Análisis de composición de órdenes**: Facilita ver qué productos tiene cada orden

**Vista que lo usa:** `vw_ventas_por_orden` y `vw_resumen_usuarios`

---

### 4. `idx_orden_detalles_producto_id`

**Definición:**
```sql
CREATE INDEX idx_orden_detalles_producto_id
ON orden_detalles (producto_id);
```

**¿Para qué sirve?**

Este es uno de los índices más importantes porque se usa en varias vistas. Ayuda a saber qué tan bien se vende cada producto, cuántas veces se ha comprado y en qué órdenes aparece.

**Ejemplo práctico:**
Se quiere saber cuántas veces se vendió el "iPhone 15":
- Sin índice: Revisa cada detalle de orden uno por uno (si hay 5000 detalles, revisa los 5000)
- Con índice: "Dame todos los detalles donde el producto es iPhone 15" (encuentra solo los relevantes)

**Operaciones que optimiza:**
- **JOIN entre orden_detalles y productos**: Encuentra todas las ventas de un producto específico
- **GROUP BY producto**: Agrupa las ventas por producto para saber cuáles son más populares
- **SUM(cantidad)**: Suma cuántas unidades se vendieron de cada producto
- **HAVING con filtros**: Filtra productos con más de X ventas de forma eficiente
- **Análisis de popularidad**: Identifica productos estrella y productos de baja rotación

**Vistas que lo usan:** `vw_productos_mas_vendidos`, `vw_ranking_productos`, y `vw_ventas_por_categoria`

---

### 5. `idx_productos_id_nombre`

**Definición:**
```sql
CREATE INDEX idx_productos_id_nombre
ON productos (id, nombre);
```

**¿Para qué sirve?**

Este es un **índice compuesto** (tiene dos columnas). Es especial porque optimiza tanto el agrupamiento como el ordenamiento de productos. Se usa específicamente para el ranking de productos donde se necesita el ID y el nombre juntos.

**¿Por qué compuesto?**
Porque en la vista `vw_ranking_productos` hacemos `GROUP BY p.id, p.nombre`. PostgreSQL puede usar este índice para acceder a ambas columnas a la vez, en lugar de hacer dos búsquedas separadas.

**Ejemplo práctico:**
- Sin índice: Busca el ID, luego busca el nombre, luego ordena todo (tres operaciones)
- Con índice compuesto: Tiene el ID y nombre ya juntos y ordenados (una operación)

**Operaciones que optimiza:**
- **GROUP BY con múltiples columnas**: Agrupa por ID y nombre simultáneamente
- **ORDER BY**: Si ordenamos por producto, el índice ya tiene los datos ordenados
- **SELECT de ambas columnas**: Acceso rápido a ID y nombre juntos
- **Funciones de ventana (RANK, ROW_NUMBER)**: Optimiza el cálculo de rankings
- **Operaciones de sorting**: Reduce el tiempo de ordenamiento significativamente

**Vista que lo usa:** `vw_ranking_productos`

---

## ¿QUÉ ES EXPLAIN?

`EXPLAIN` es una herramienta súper útil que nos dice **cómo** PostgreSQL va a ejecutar una consulta. Es como pedirle a la base de datos que nos cuente su plan antes de hacerlo.

Muestra el "plan de ejecución" que PostgreSQL va a usar, pero **NO ejecuta** la consulta.

```sql
EXPLAIN
SELECT * FROM vw_ventas_por_categoria;
```

**¿Qué te muestra?**
- Qué tipo de escaneo va a hacer (Seq Scan, Index Scan, etc.)
- Qué índices va a usar
- En qué orden va a hacer los JOINs
- Estimación de cuántas filas va a revisar
- Costo estimado de la operación

**Tipos de escaneo que puedes ver:**
- **Seq Scan**: Escaneo secuencial (lee toda la tabla) - MALO 🐢
- **Index Scan**: Usa un índice específico - BUENO 🚀
- **Bitmap Index Scan**: Usa múltiples índices - BUENO 🚀
- **Hash Join**: Unión usando hash - NEUTRAL
- **Nested Loop**: Bucle anidado para JOIN - Depende del contexto

**Ejemplo de salida:**
```
Hash Join  (cost=1.36..2.51 rows=11 width=426)
  Hash Cond: (od.producto_id = p.id)
  ->  Seq Scan on orden_detalles od  (cost=0.00..1.11 rows=11 width=8)
  ->  Hash  (cost=1.16..1.16 rows=16 width=422)
        ->  Index Scan using idx_productos_id_nombre on productos p  (cost=0.00..1.16 rows=16 width=422)
```

**¿Qué significa esto?**
- `cost=1.36..2.51`: Costo estimado (menor es mejor)
- `rows=11`: Cuántas filas estima que va a procesar
- `width=426`: Tamaño promedio de cada fila en bytes
- `Index Scan using idx_productos_id_nombre`: Está planeando usar el índice

### **Verificación de nuestros índices**

En el archivo `indexes.sql` ya incluimos los comandos para verificar que los índices se estén usando:

```sql
-- Verifica si se usa idx_productos_categoria_id
EXPLAIN
SELECT * FROM vw_ventas_por_categoria;

-- Verifica si se usa idx_orden_detalles_producto_id
EXPLAIN
SELECT * FROM vw_productos_mas_vendidos;

-- Verifica si se usa idx_ordenes_usuario_id
EXPLAIN
SELECT * FROM vw_resumen_usuarios;
```

**¿Qué buscamos en la salida?**
- "Index Scan using idx_..." = El índice se va a usar (BIEN)
- "Seq Scan on ..." = NO va a usar índice (MAL, hay que revisar)

---

## RESUMEN RÁPIDO

**El proyecto tiene:**
- 5 tablas principales (categorias, usuarios, productos, ordenes, orden_detalles)
- 5 vistas de reportes (para analizar ventas, usuarios y productos)
- 5 índices estratégicos (para hacer las consultas súper rápidas)

**Para correrlo:**
```bash
docker compose up --build
```

**Para verificar los índices:**
Conéctarse a PostgreSQL y ejecutar los comandos EXPLAIN que están en `indexes.sql`

**Tecnologías:**
- PostgreSQL 16 (base de datos)
- Next.js 16 (frontend)
- Docker (contenedores)

---

## 🎓 CONCLUSIÓN

Los índices son como agregar un mapa a tu base de datos. Sin ellos, PostgreSQL tiene que buscar todo de forma secuencial (lento). Con ellos, va directo a lo que necesita (rápido). 

En este proyecto, identificamos las operaciones más comunes (JOINs y GROUP BYs en las vistas) y creamos índices específicos para optimizarlas. El resultado es que las consultas se ejecutan en milisegundos en lugar de segundos.
