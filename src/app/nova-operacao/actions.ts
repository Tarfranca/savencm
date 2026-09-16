'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function uploadInvoice(formData: FormData) {
  const supabase = await createClient()
  const file = formData.get('file') as File | null

  if (!file || file.size === 0) {
    throw new Error('Nenhum arquivo enviado.')
  }

  const ext = file.name.split('.').pop() ?? 'bin'
  const storagePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('invoices')
    .upload(storagePath, file, { contentType: file.type, upsert: false })

  if (uploadError) throw new Error(`Storage: ${uploadError.message}`)

  const { data: lote, error: loteError } = await supabase
    .from('lotes')
    .insert({
      nome_arquivo: file.name,
      arquivo_storage_path: storagePath,
      status: 'processando',
      cambio_utilizado: 5.42,
    })
    .select('id')
    .single()

  if (loteError || !lote) throw new Error(`Banco: ${loteError?.message}`)

  redirect(`/processando/${lote.id}`)
}
