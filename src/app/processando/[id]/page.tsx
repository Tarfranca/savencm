import { ProcessandoClient } from './ProcessandoClient'
import { createClient } from '@/lib/supabase/server'

export default async function ProcessandoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (id === 'demo') {
    return <ProcessandoClient loteId="demo" fileName="Invoice_Fornecedor_DE_2026.pdf" />
  }

  const supabase = await createClient()
  const { data: lote } = await supabase
    .from('lotes')
    .select('id, nome_arquivo, status')
    .eq('id', id)
    .single()

  return (
    <ProcessandoClient
      loteId={id}
      fileName={lote?.nome_arquivo ?? 'invoice.pdf'}
      initialStatus={lote?.status}
    />
  )
}
