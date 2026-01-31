export const dynamic = 'force-dynamic';
import { pool } from '@/lib/db';
import { z } from 'zod';

const pageSchema = z.object({
  page: z.string().optional(),
});

export default async function Reporte4({ searchParams }: any) {
  const params = await searchParams;
  
  const result = pageSchema.safeParse(params);
  let page = 1;
  
  if (result.success && result.data.page) {
    const pageNum = Number(result.data.page);
    if (pageNum > 0) {
      page = pageNum;
    }
  }

  const limit = 5;
  const offset = (page - 1) * limit;

  const { rows } = await pool.query(
    'SELECT * FROM vw_ranking_productos ORDER BY ranking LIMIT $1 OFFSET $2',
    [limit, offset]
  );

  const top = rows[0];

  return (
    <div>
      <h1>Ranking de Productos</h1>
      <p>Productos ordenados por total vendido.</p>

      {top && <p>Top: {top.producto} - ${top.total_vendido}</p>}

      <p>Página {page} (mostrando {limit} productos)</p>

      <table>
        <tr>
          <th>Ranking</th>
          <th>Producto</th>
          <th>Total Vendido</th>
          <th>Nivel</th>
        </tr>
        {rows.map((r) => (
          <tr key={r.producto_id}>
            <td>{r.ranking}</td>
            <td>{r.producto}</td>
            <td>${r.total_vendido}</td>
            <td>{r.nivel_venta}</td>
          </tr>
        ))}
      </table>

      <p>
        {page > 1 && <a href={`/reports/4?page=${page - 1}`}> Anterior</a>}
        {' '}
        <a href={`/reports/4?page=${page + 1}`}>Siguiente </a>
      </p>
    </div>
  );
}