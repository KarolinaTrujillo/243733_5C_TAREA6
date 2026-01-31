export const dynamic = 'force-dynamic';
import { pool } from '@/lib/db';

export default async function Reporte5() {
  const { rows } = await pool.query(
    'SELECT * FROM vw_ventas_por_orden'
  );

  const top = rows[0]; // orden de mayor venta

  return (
    <div>
      <h1>Ventas por Orden</h1>
      <p>Listado de órdenes con total vendido.</p>

      <p>
        <strong>Orden líder:</strong> {top.orden_id} (${top.total_orden})
      </p>

      <table>
        <thead>
          <tr>
            <th>Orden</th>
            <th>Total Vendido</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.orden_id}>
              <td>{r.orden_id}</td>
              <td>${r.total_orden}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
