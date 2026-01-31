export const dynamic = 'force-dynamic';
import { pool } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

export default async function Reporte3({ searchParams }: any) {
  const params = await searchParams;

  // Validar con Zod
  const result = schema.safeParse(params);
  
  let page = 1;
  let limit = 5;

  if (result.success) {
    if (result.data.page) {
      const p = Number(result.data.page);
      if (p > 0) page = p;
    }
    if (result.data.limit) {
      const l = Number(result.data.limit);
      if (l > 0 && l <= 20) limit = l;
    }
  }

  const offset = (page - 1) * limit;

  // Query con paginación
  const { rows } = await pool.query(
    'SELECT * FROM vw_resumen_usuarios ORDER BY total_gastado DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );

  // Calcular KPI
  let totalPagina = 0;
  for (const row of rows) {
    totalPagina += Number(row.total_gastado);
  }

  return (
    <div>
      <h1>Resumen por Usuario</h1>
      <p>Órdenes y gasto total por usuario.</p>

      <p><strong>Total en esta página:</strong> ${totalPagina.toFixed(2)}</p>

      <p>Página {page} - Mostrando {limit} registros</p>

      <table>
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Total Órdenes</th>
            <th>Total Gastado</th>
            <th>Tipo</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.usuario_id}>
              <td>{r.usuario}</td>
              <td>{r.total_ordenes}</td>
              <td>${r.total_gastado}</td>
              <td>{r.tipo_cliente}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {rows.length === 0 && <p>No hay datos en esta página.</p>}

      <p>
        {page > 1 && <a href={`/reports/3?page=${page - 1}&limit=${limit}`}>Anterior</a>}
        {' '}
        {rows.length > 0 && <a href={`/reports/3?page=${page + 1}&limit=${limit}`}>Siguiente</a>}
      </p>
    </div>
  );
}