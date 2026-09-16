import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('lotes')
    .select('status')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ status: 'erro' }, { status: 404 })
  }

  return NextResponse.json({ status: data.status })
}
