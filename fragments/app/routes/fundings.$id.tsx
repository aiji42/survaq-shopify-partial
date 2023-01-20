import { DataFunctionArgs, json } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { Fundings } from '~/components/fundings'

const fetchFundings = async (
  id: string
): Promise<{
  totalPrice: string
  supporter: string
  status: string
}> => {
  const data: any = await fetch(`https://api.survaq.com/products/${id}`).then(
    (res) => res.json()
  )

  const remainDays = Math.ceil(
    (new Date(data.foundation.closeOn).getTime() - new Date().getTime()) /
      86400000
  )

  return {
    totalPrice: data.foundation.totalPrice.toLocaleString('JP', {
      style: 'currency',
      currency: 'JPY'
    }),
    supporter: `${data.foundation.supporter.toLocaleString()}人`,
    status:
      remainDays === 0
        ? '最終日'
        : remainDays < 0
        ? '販売中'
        : `${remainDays}日`
  }
}

export const loader = async ({ params }: DataFunctionArgs) => {
  const id = params.id!

  return json(await fetchFundings(id))
}

export const handle = { hydrate: false }

export default function Index() {
  const data = useLoaderData<typeof loader>()
  return <Fundings {...data} />
}
