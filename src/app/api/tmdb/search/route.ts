import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q?.trim()) return NextResponse.json({ results: [] });

  const key = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!key) return NextResponse.json({ results: [] }, { status: 500 });

  const res = await fetch(
    `https://api.themoviedb.org/3/search/multi?api_key=${key}&query=${encodeURIComponent(q)}&include_adult=false`,
    { next: { revalidate: 60 } }
  );

  if (!res.ok) return NextResponse.json({ results: [] }, { status: res.status });

  const data = await res.json();
  return NextResponse.json(data);
}
