'use client';

export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface Reporte2Data {
  rows: any[];
  total: number;
}

function Reporte2Content() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<Reporte2Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const minVentas = searchParams.get('minVentas');
        const params = new URLSearchParams();
        if (minVentas) {
          params.append('minVentas', minVentas);
        }

        const response = await fetch(`/api/reports/2?${params}`, {
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
  }, [searchParams]);

  return (
    <div>
      <h1>Productos con Alta Rotación</h1>
      <p>Productos con mayor volumen de ventas.</p>

      <form>
        Ventas mínimas: <input type="number" name="minVentas" />
        <button>Filtrar</button>
      </form>

      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {data && (
        <>
          <p><strong>Total de productos:</strong> {data.total}</p>

          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Total vendido</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => (
                <tr key={r.producto_id}>
                  <td>{r.producto}</td>
                  <td>{r.total_vendido}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default function Reporte2() {
  return (
    <Suspense fallback={<p>Cargando...</p>}>
      <Reporte2Content />
    </Suspense>
  );
}