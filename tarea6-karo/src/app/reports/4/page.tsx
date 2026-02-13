'use client';

export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface Reporte4Data {
  rows: any[];
  page: number;
  limit: number;
  top: any | null;
}

function Reporte4Content() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<Reporte4Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const page = searchParams.get('page');
        const params = new URLSearchParams();
        if (page) params.append('page', page);

        const response = await fetch(`/api/reports/4?${params}`, {
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

  if (loading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!data) return <p>No hay datos</p>;

  return (
    <div>
      <h1>Ranking de Productos</h1>
      <p>Productos ordenados por total vendido.</p>

      {data.top && <p>Top: {data.top.producto} - ${data.top.total_vendido}</p>}

      <p>Página {data.page} (mostrando {data.limit} productos)</p>

      <table>
        <thead>
          <tr>
            <th>Ranking</th>
            <th>Producto</th>
            <th>Total Vendido</th>
            <th>Nivel</th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((r) => (
            <tr key={r.producto_id}>
              <td>{r.ranking}</td>
              <td>{r.producto}</td>
              <td>${r.total_vendido}</td>
              <td>{r.nivel_venta}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p>
        {data.page > 1 && <a href={`/reports/4?page=${data.page - 1}`}> Anterior</a>}
        {' '}
        <a href={`/reports/4?page=${data.page + 1}`}>Siguiente </a>
      </p>
    </div>
  );
}

export default function Reporte4() {
  return (
    <Suspense fallback={<p>Cargando...</p>}>
      <Reporte4Content />
    </Suspense>
  );
}