import { NextResponse } from 'next/server';
import { updateCardProgress } from '@/lib/queries';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { quality, repetition, intervalDays, easinessFactor } = body;

    await updateCardProgress(id, repetition, intervalDays, easinessFactor, quality);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update progress error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
