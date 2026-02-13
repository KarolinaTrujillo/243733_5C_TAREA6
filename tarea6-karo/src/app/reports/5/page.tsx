'use client';

export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from 'react';

interface Reporte5Data {
  rows: any[];
  top: any | null;
}

function Reporte5Content() {
  const [data, setData] = useState<Reporte5Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/reports/5', {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Error fetching data');
        }

        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError('Error al cargar los datos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!data) return <p>No hay datos</p>;

  return (
    <div>
      <h1>Ventas por Orden</h1>
      <p>Listado de órdenes con total vendido.</p>

      <p>
        <strong>Orden líder:</strong> {data.top?.orden_id} (${data.top?.total_orden})
      </p>

      <table>
        <thead>
          <tr>
            <th>Orden</th>
            <th>Total Vendido</th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((r) => (
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

export default function Reporte5() {
  return (
    <Suspense fallback={<p>Cargando...</p>}>
      <Reporte5Content />
    </Suspense>
  );
}