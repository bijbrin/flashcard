import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    database_url_set: !!process.env.DATABASE_URL,
    database_url_length: process.env.DATABASE_URL?.length || 0,
    node_env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
}