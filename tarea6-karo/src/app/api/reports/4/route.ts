import { getReporte4Data } from './service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = {
      page: searchParams.get('page') || undefined,
    };

    const data = await getReporte4Data(params);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 });
  }
}
