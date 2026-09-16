import BuscarNcmsClient from './BuscarNcmsClient'

export default async function BuscarNcmsPage({
  searchParams,
}: {
  searchParams: Promise<{ item_id?: string; item_desc?: string }>
}) {
  const sp = await searchParams
  return (
    <BuscarNcmsClient
      itemId={sp.item_id}
      itemDescricao={sp.item_desc ? decodeURIComponent(sp.item_desc) : undefined}
    />
  )
}
