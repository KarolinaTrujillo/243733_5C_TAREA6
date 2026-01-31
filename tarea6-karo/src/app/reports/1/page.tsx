export const dynamic = 'force-dynamic';
import { pool } from '@/lib/db';
import { z } from 'zod';

const filterSchema = z.object({
  categoria_id: z.string().optional(),
});

export default async function Reporte1({ searchParams }: any) {
  const params = await searchParams;
  
  const result = filterSchema.safeParse(params);
  const categoriaId = result.success ? result.data.categoria_id : undefined;

  let query = 'SELECT * FROM vw_ventas_por_categoria';
  const values = [];

  if (categoriaId) {
    query += ' WHERE categoria_id = $1';
    values.push(categoriaId);
  }

  const { rows } = await pool.query(query, values);

  let total = 0;
  for (const row of rows) {
    total += Number(row.total_vendido);
  }

  return (
    <div>
      <h1>Ventas por Categoría</h1>
      <p>Total vendido por cada categoría.</p>

      {/* FILTRO MÁS SIMPLE POSIBLE */}
      <form>
        Filtrar: <input type="number" name="categoria_id" />
        <button>Buscar</button>
      </form>

      <p>Total: ${total.toFixed(2)}</p>

      <table>
        <thead>
          <tr>
            <th>Categoría</th>
            <th>Total vendido</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.categoria_id}>
              <td>{r.categoria}</td>
              <td>${r.total_vendido}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}