'use client';

export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface Reporte3Data {
  rows: any[];
  totalPagina: number;
  page: number;
  limit: number;
}

function Reporte3Content() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<Reporte3Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const page = searchParams.get('page');
        const limit = searchParams.get('limit');
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);

        const response = await fetch(`/api/reports/3?${params}`, {
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
      <h1>Resumen por Usuario</h1>
      <p>Órdenes y gasto total por usuario.</p>

      <p><strong>Total en esta página:</strong> ${data.totalPagina.toFixed(2)}</p>

      <p>Página {data.page} - Mostrando {data.limit} registros</p>

      <table>
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Total Órdenes</th>
            <th>Total Gastado</th>
            <th>Tipo</th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((r) => (
            <tr key={r.usuario_id}>
              <td>{r.usuario}</td>
              <td>{r.total_ordenes}</td>
              <td>${r.total_gastado}</td>
              <td>{r.tipo_cliente}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {data.rows.length === 0 && <p>No hay datos en esta página.</p>}

      <p>
        {data.page > 1 && <a href={`/reports/3?page=${data.page - 1}&limit=${data.limit}`}>Anterior</a>}
        {' '}
        {data.rows.length > 0 && <a href={`/reports/3?page=${data.page + 1}&limit=${data.limit}`}>Siguiente</a>}
      </p>
    </div>
  );
}

export default function Reporte3() {
  return (
    <Suspense fallback={<p>Cargando...</p>}>
      <Reporte3Content />
    </Suspense>
  );
}