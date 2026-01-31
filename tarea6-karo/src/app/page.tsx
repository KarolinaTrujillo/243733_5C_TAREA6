import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <h1>Dashboard de Reportes</h1>

      <ul>
        <li><Link href="/reports/1">Reporte 1 - Ventas por Categoría</Link></li>
        <li><Link href="/reports/2">Reporte 2 - Productos con Alta Rotación</Link></li>
        <li><Link href="/reports/3">Reporte 3 - Resumen de Usuarios</Link></li>
        <li><Link href="/reports/4">Reporte 4 - Ranking de Productos</Link></li>
        <li><Link href="/reports/5">Reporte 5 - Ventas por Orden</Link></li>
      </ul>
    </div>
  );
}