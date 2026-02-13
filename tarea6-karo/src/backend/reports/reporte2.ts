import { pool } from '@/lib/db';
import { z } from 'zod';

const filterSchema = z.object({
  minVentas: z.string().optional(),
});

export async function getReporte2Data(params: any) {
  const validated = filterSchema.safeParse(params);
  const minVentas = validated.success && validated.data.minVentas 
    ? Number(validated.data.minVentas) 
    : null;

  let query = 'SELECT * FROM vw_productos_mas_vendidos';
  const values = [];

  if (minVentas && minVentas > 0) {
    query += ' WHERE total_vendido >= $1';
    values.push(minVentas);
  }

  const { rows } = await pool.query(query, values);

  return {
    rows,
    total: rows.length,
  };
}
