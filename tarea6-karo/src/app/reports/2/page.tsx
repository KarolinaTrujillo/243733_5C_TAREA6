export const dynamic = 'force-dynamic';
import { pool } from '@/lib/db';
import { z } from 'zod';

const filterSchema = z.object({
  minVentas: z.string().optional(),
});

export default async function Reporte2({ searchParams }: any) {
  const params = await searchParams;
  
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

  return (
    <div>
      <h1>Productos con Alta Rotación</h1>
      <p>Productos con mayor volumen de ventas.</p>

      <form>
        Ventas mínimas: <input type="number" name="minVentas" />
        <button>Filtrar</button>
      </form>

      <p><strong>Total de productos:</strong> {rows.length}</p>

      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Total vendido</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.producto_id}>
              <td>{r.producto}</td>
              <td>{r.total_vendido}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}