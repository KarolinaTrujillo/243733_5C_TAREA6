import { pool } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

export async function getReporte3Data(params: any) {
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

  const { rows } = await pool.query(
    'SELECT * FROM vw_resumen_usuarios ORDER BY total_gastado DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );

  let totalPagina = 0;
  for (const row of rows) {
    totalPagina += Number(row.total_gastado);
  }

  return {
    rows,
    totalPagina,
    page,
    limit,
  };
}
