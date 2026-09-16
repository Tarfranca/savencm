'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function aprovarItem(loteItemId: string, loteId: string) {
  const supabase = await createClient()
  await supabase
    .from('lote_itens')
    .update({ status: 'validado' })
    .eq('id', loteItemId)
  revalidatePath(`/resultado/${loteId}`)
}

export async function aprovarTodos(loteId: string) {
  const supabase = await createClient()
  await supabase
    .from('lote_itens')
    .update({ status: 'validado' })
    .eq('lote_id', loteId)
  revalidatePath(`/resultado/${loteId}`)
}
