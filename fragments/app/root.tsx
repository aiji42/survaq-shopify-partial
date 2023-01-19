import type { MetaFunction, LinksFunction } from '@remix-run/cloudflare'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  useMatches
} from '@remix-run/react'
import { cssBundleHref } from '@remix-run/css-bundle'

export const meta: MetaFunction = () => ({
  charset: 'utf-8'
})

export const links: LinksFunction = () => {
  return cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []
}

export default function App() {
  const matches = useMatches()
  const includeScripts = matches.some((match) => match.handle?.hydrate)

  return (
    <html>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        {includeScripts ? <Scripts /> : null}
        <LiveReload />
      </body>
    </html>
  )
}
