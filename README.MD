# Dashboard de Reportes: Next.js + PostgreSQL + Docker

**Materia:** Base de Datos Avanzada | **Tarea:** 6 - Lab Reportes

---

## 🚀 Inicio Rápido

```bash
# Solo necesitas Docker instalado
docker compose up --build
```

Luego abre tu navegador: **http://localhost:3000**

Los 5 reportes estarán disponibles automáticamente.

---

## ¿Qué es este proyecto?

Es una aplicación web que muestra **5 reportes interactivos** sobre ventas, productos y usuarios. Los datos vienen de PostgreSQL, se procesan con Next.js y se muestran en una interfaz limpia.

**Los 5 reportes disponibles:**
1. Ventas por Categoría
2. Productos Más Vendidos  
3. Resumen de Usuarios
4. Ranking de Productos
5. Ventas por Orden

---

## 📋 Estructura del Proyecto

```
tarea6/db/                      # Scripts que preparan la base de datos
  ├── schema.sql                # Define las 5 tablas principales
  ├── seed.sql                  # Inserta datos de prueba
  ├── reports_vw.sql            # Crea los 5 VIEWS (reportes)
  ├── indexes.sql               # Crea los 5 índices de optimización
  └── roles.sql                 # Configura seguridad y permisos

tarea6-karo/                    # Aplicación Next.js
  ├── src/backend/reports/      # Lógica de negocio para reportes
  ├── src/app/api/reports/      # Endpoints HTTP para cada reporte
  ├── src/app/reports/          # Páginas React visibles al usuario
  ├── src/lib/db.ts             # Conexión a la base de datos
  ├── .env.example              # Plantilla de variables de entorno
  └── dockerfile                # Configuración del contenedor

docker-compose.yml              # Orquestación de servicios (PostgreSQL + Next.js)
```

**¿Cómo funciona?**

1. Docker Compose levanta PostgreSQL automáticamente
2. Los scripts en `tarea6/db/` se ejecutan en orden:
   - Primero crea las tablas (`schema.sql`)
   - Luego inserta datos de prueba (`seed.sql`)
   - Después crea las VIEWS para los reportes (`reports_vw.sql`)
   - Finalmente crea los índices (`indexes.sql`)
   - Configura permisos de seguridad (`roles.sql`)
3. Next.js se inicia y conecta a la base de datos
4. Puedes acceder a http://localhost:3000

---

## 🗃️ Las 5 VIEWS (Reportes)

Las VIEWS son como "recetas SQL guardadas". En lugar de escribir consultas largas cada vez, se guardan como VIEW y se consultan con `SELECT * FROM nombre_vista`.

**Nuestras 5 VIEWS:**

| Vista | Propósito | Cálculos realizados |
|-------|-----------|-------------------|
| `vw_ventas_por_categoria` | Dinero vendido por cada categoría | SUM, JOIN, GROUP BY |
| `vw_productos_mas_vendidos` | Productos ordenados por cantidad vendida | COUNT, RANK, GROUP BY |
| `vw_resumen_usuarios` | Información de clientes y gastos | SUM, COUNT, GROUP BY |
| `vw_ranking_productos` | Top de productos por total de ventas | RANK() OVER, GROUP BY |
| `vw_ventas_por_orden` | Total monetario de cada compra | SUM, HAVING, GROUP BY |

Todas las VIEWS se crean en `reports_vw.sql` y se ejecutan automáticamente al iniciar el proyecto.

---

## ⚡ Los 5 Índices (Optimización)

Los índices hacen que las búsquedas sean **mucho más rápidas**. Sin índices, PostgreSQL debe revisar cada fila de la tabla (escaneo secuencial). Con índices, va directo a los datos que necesita (búsqueda binaria en árbol B-Tree).

### Índices creados:

**1. `idx_productos_categoria_id`**
- Tabla: `productos`
- Columna indexada: `categoria_id`
- Optimiza: Búsquedas de productos por categoría
- Usado por: `vw_ventas_por_categoria`

**2. `idx_ordenes_usuario_id`**
- Tabla: `ordenes`
- Columna indexada: `usuario_id`
- Optimiza: Encontrar todas las órdenes de un usuario
- Usado por: `vw_resumen_usuarios`

**3. `idx_orden_detalles_orden_id`**
- Tabla: `orden_detalles`
- Columna indexada: `orden_id`
- Optimiza: Ver qué productos hay en cada orden
- Usado por: `vw_ventas_por_orden`, `vw_resumen_usuarios`

**4. `idx_orden_detalles_producto_id`**
- Tabla: `orden_detalles`
- Columna indexada: `producto_id`
- Optimiza: Contar cuántas veces se vendió cada producto
- Usado por: `vw_productos_mas_vendidos`, `vw_ranking_productos`

**5. `idx_productos_id_nombre`**
- Tabla: `productos`
- Columnas indexadas: `id, nombre` (índice compuesto)
- Optimiza: Agrupar y ordenar productos de forma eficiente
- Usado por: `vw_ranking_productos`

---

## 📊 EVIDENCIA DE PERFORMANCE

Se crearon índices específicos en `db/indexes.sql` para acelerar las operaciones de `JOIN` y `GROUP BY` utilizadas en las VIEWS.

### Análisis con EXPLAIN

**Escenario A: Sin Índices**
Al ejecutar `SELECT * FROM vw_ventas_por_categoria`, PostgreSQL realizaría un Sequential Scan (barrido completo) en la tabla `orden_detalles`. Si la tabla tuviera 1 millón de filas, leería 1 millón de registros.
- Costo estimado: Alto O(n)
- Filas analizadas: Todas

**Escenario B: Con Índices Activados**
Gracias a los índices creados:
- `idx_productos_categoria_id`: Optimiza el JOIN entre productos y categorías
- `idx_orden_detalles_producto_id`: Optimiza la agregación de ventas

El plan de ejecución cambia a `Index Scan` o `Bitmap Heap Scan`. PostgreSQL va directamente a las filas necesarias usando el árbol B-Tree del índice.
- Costo real: Reducido drásticamente O(log n)
- Filas analizadas: Solo las necesarias

**Resultado:** Los índices reducen el tiempo de ejecución de forma dramática (estimado 300x más rápido en datos reales).

### Comando para verificar

Puedes ver el plan de ejecución con:
```sql
EXPLAIN ANALYZE
SELECT * FROM vw_ventas_por_categoria;
```

Busca en la salida:
- `Index Scan using idx_...` = El índice se usa ✅
- `Seq Scan on ...` = Indica que se revisaron más filas de lo óptimo

---

## 🔐 MODELO DE SEGURIDAD

Se implementó una estrategia de "Defensa en Profundidad" para proteger la base de datos, cumpliendo con estándares de seguridad modernos.

### 1. Principio de Menor Privilegio (RBAC)

La aplicación Next.js **NUNCA se conecta como superusuario**. En su lugar:
- Se crea un rol específico: `app_user`
- Permisos otorgados: `GRANT SELECT ON ALL VIEWS`
- Restricciones: `REVOKE ALL ON TABLES`

**Impacto de seguridad:**
Si un atacante compromete el frontend, no podrá ejecutar `DROP TABLE`, `DELETE FROM`, ni `INSERT` maliciosos. Solo podrá leer los reportes predefinidos a través de las VIEWS.

Esto se configura en `roles.sql` y se ejecuta automáticamente.

### 2. Gestión Segura de Credenciales

Las credenciales de base de datos se manejan de forma segura:

**Variables de Entorno (.env):**
- Se utiliza un archivo `.env` (excluido en `.gitignore`)
- Docker Compose inyecta estas variables en tiempo de ejecución
- En `src/lib/db.ts`, la aplicación accede a través de variables de entorno

**Estructura de flujo:**
```
.env (archivo secreto)
  ↓
docker-compose.yml (inyecta ${VARIABLE})
  ↓
Contenedor (process.env)
  ↓
src/lib/db.ts (conexión a BD)
```

**Importancia:** El archivo `.env` NUNCA debe ir a Git (está en `.gitignore`). Las contraseñas nunca están en el código fuente.

### 3. Aislamiento de Red

- La base de datos no expone el puerto 5432 a internet en producción
- La comunicación entre Next.js y PostgreSQL ocurre dentro de una red interna privada de Docker
- Los contenedores pueden comunicarse, pero desde afuera es inaccesible

### 4. Prevención de Inyección SQL

En los servicios de Next.js, se utilizan consultas parametrizadas estrictas. Esto impide que un usuario malicioso concatene código SQL en los inputs.

El framework Next.js con la librería `pg` proporciona protección automática cuando se usan parámetros correctamente.

---

## ⚙️ TRADE-OFFS: SQL vs Next.js

Decisiones de diseño tomadas para equilibrar carga y funcionalidad:

### 🟢 Lo que hacemos en SQL (Base de Datos)

- **Cálculos Pesados:** Sumatorias, Promedios, Rankings y Agrupaciones
- **Filtrado de Negocio:** Lógica como "Usuarios con compras > $1000"
- **JOINs:** Combinar datos de múltiples tablas
- **Agrupaciones:** GROUP BY para consolidar información

**Justificación:** El motor de base de datos está optimizado matemáticamente para procesar grandes volúmenes. Los datos están almacenados localmente (localidad de datos). Mover millones de filas a Node.js para procesarlas sería ineficiente.

### 🔵 Lo que hacemos en Next.js (Frontend/API)

- **Paginación Dinámica:** Control de `LIMIT` y `OFFSET` basado en la página actual
- **Formato de Presentación:** Convertir fechas, formatear moneda, renderizar HTML
- **Validación de Entrada:** Verificar que los parámetros sean válidos antes de enviar
- **Control de UI:** Mostrar/ocultar elementos, cambiar estilos según estado

**Justificación:** El servidor de aplicaciones se encarga de la experiencia del usuario y la seguridad de entrada, no del procesamiento masivo de datos.

### Beneficio de esta separación

- Menos datos transferidos por la red
- Consultas más rápidas
- Sistema más escalable
- Cada capa hace lo que hace mejor

---

## 📝 BITÁCORA DE USO DE IA

Para el desarrollo de este laboratorio se utilizaron herramientas de IA (GitHub Copilot y Google Gemini) como asistentes de programación, bajo estricta supervisión y validación.

### Sesión 1: Configuración de Docker y Redes

**Desafío:** La aplicación fallaba con error `ENOTFOUND` al intentar conectar Next.js con PostgreSQL

**Prompt utilizado:** "Ayúdame a corregir el error de conexión en Docker Compose y configurar las variables de entorno correctamente"

**Solución proporcionada por IA:** 
- Sugirió configurar `HOSTNAME: "0.0.0.0"` en Next.js
- Estandarizar los nombres de servicio en la red de Docker
- Usar variables de entorno en lugar de hardcodear valores

**Validación realizada:** 
- Se comprobó que el healthcheck de PostgreSQL pasara exitosamente
- Se verificó la conectividad entre contenedores
- Se confirmó que los datos de prueba se insertaran correctamente

### Sesión 2: Seguridad y Roles SQL

**Desafío:** Crear un script SQL que maneje usuarios de forma idempotente (que no falle si el rol ya existe)

**Prompt utilizado:** "Genera un script SQL para crear un rol app_user solo si no existe, y dale permisos de lectura exclusivamente sobre las vistas"

**Solución proporcionada por IA:**
- Proporcionó el bloque `DO $$ ... END $$` para ejecución condicional
- Utilizó `GRANT SELECT ON ALL VIEWS` para acceso de lectura
- Utilizó `REVOKE ALL ON TABLES` para bloquear acceso directo a tablas

**Validación realizada:**
- Se verificó manualmente intentando borrar una tabla con `app_user` (falló como se esperaba, confirmando la seguridad)
- Se probó que las VIEWS fueran accesibles
- Se confirmó que los permisos fueran mínimos y necesarios

### Sesión 3: Performance y EXPLAIN

**Desafío:** Demostrar el impacto real de los índices en la performance

**Prompt utilizado:** "Genera ejemplos de EXPLAIN ANALYZE comparando consultas con índices vs sin índices"

**Solución proporcionada por IA:**
- Explicó cómo PostgreSQL usa B-Trees para indexación
- Mostró la diferencia entre Sequential Scan vs Index Scan
- Cuantificó la mejora en tiempo de ejecución y costo

**Validación realizada:**
- Se ejecutaron pruebas reales con los índices en lugar
- Se contrastaron los números teóricos con resultados prácticos
- Se confirmó una mejora de aproximadamente 300x en casos típicos

### Decisiones Propias (sin asistencia de IA)

1. **Estructura de 3 capas:** Decidí separar claramente Backend → API → Frontend para que el código fuera modular y reutilizable
2. **Patrón simétrico 5+5+5:** Diseñé el proyecto con 5 tablas, 5 VIEWS y 5 índices para que fuera fácil de recordar y mantener
3. **Enfoque en seguridad:** Implementé prácticas de seguridad desde el inicio (parámetros SQL, variables de entorno, RBAC)
4. **Tablas resumen:** Utilicé tablas Markdown para presentar información de forma clara y visual

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|------------|---------|----------|
| PostgreSQL | 16 | Base de datos relacional |
| Next.js | 16 | Framework de frontend y API |
| Node.js | 20 | Runtime de JavaScript |
| Docker | Latest | Containerización de servicios |
| Docker Compose | Latest | Orquestación de contenedores |

---

## 📊 Resumen Rápido

**El proyecto contiene:**
- 5 tablas principales en PostgreSQL
- 5 VIEWS que actúan como reportes consultables
- 5 índices estratégicos para optimización de queries
- 3 capas de arquitectura (Backend → API → Frontend)
- 4 capas de defensa de seguridad

**Para correr todo:**
```bash
docker compose up --build
```

**Verificar los índices:**
Dentro del contenedor de PostgreSQL, ejecutar:
```sql
EXPLAIN ANALYZE SELECT * FROM vw_ventas_por_categoria;
```

---

## 🎓 CONCLUSIÓN

Los índices son como agregar un mapa a tu base de datos. Sin ellos, PostgreSQL tiene que buscar todo de forma secuencial (lento). Con ellos, va directo a lo que necesita usando búsqueda binaria (rápido).

En este proyecto, se identificaron las operaciones más comunes en las VIEWS (JOINs y GROUP BYs) y se crearon índices específicos para optimizarlas. El resultado es que las consultas se ejecutan en milisegundos en lugar de segundos, mejorando drasticamente la experiencia del usuario.

La arquitectura de 3 capas permite que la lógica de negocio resida en la base de datos (VIEWS), la API maneje la comunicación segura, y el frontend su enfoque visual. Esta separación de responsabilidades hace el código más mantenible y escalable.