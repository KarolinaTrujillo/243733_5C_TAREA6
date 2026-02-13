'use client';

export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface Reporte1Data {
  rows: any[];
  total: number;
}

function Reporte1Content() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<Reporte1Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const categoriaId = searchParams.get('categoria_id');
        const params = new URLSearchParams();
        if (categoriaId) {
          params.append('categoria_id', categoriaId);
        }

        const response = await fetch(`/api/reports/1?${params}`, {
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
    <>
      <h1>Ventas por Categoría</h1>
      <p>Total vendido por cada categoría.</p>

      <form>
        Filtrar: <input type="number" name="categoria_id" />
        <button>Buscar</button>
      </form>

      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {data && (
        <>
          <p>Total: ${data.total.toFixed(2)}</p>

          <table>
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Total vendido</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => (
                <tr key={r.categoria_id}>
                  <td>{r.categoria}</td>
                  <td>${r.total_vendido}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}

export default function Reporte1() {
  return (
    <Suspense fallback={<p>Cargando...</p>}>
      <Reporte1Content />
    </Suspense>
  );
}