import { pool } from '@/lib/db';
import { z } from 'zod';

const filterSchema = z.object({
  categoria_id: z.string().optional(),
});

export async function getReporte1Data(params: any) {
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

  return {
    rows,
    total,
  };
}
