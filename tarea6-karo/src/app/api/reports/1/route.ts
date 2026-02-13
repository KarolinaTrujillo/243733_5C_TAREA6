import { getReporte1Data } from '@/backend/reports/reporte1';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = {
      categoria_id: searchParams.get('categoria_id') || undefined,
    };

    const data = await getReporte1Data(params);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 });
  }
}
