import { pool } from '@/lib/db';

export async function getReporte5Data() {
  const { rows } = await pool.query(
    'SELECT * FROM vw_ventas_por_orden'
  );

  return {
    rows,
    top: rows[0] || null,
  };
}
