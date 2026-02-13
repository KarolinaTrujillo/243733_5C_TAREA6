import { pool } from '@/lib/db';
import { z } from 'zod';

const pageSchema = z.object({
  page: z.string().optional(),
});

export async function getReporte4Data(params: any) {
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

  return {
    rows,
    page,
    limit,
    top: rows[0] || null,
  };
}
