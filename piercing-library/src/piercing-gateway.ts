import { wrapStreamInText } from './stream-utilities'

export interface FragmentConfig<Env> {
  fragmentId: string
  prePiercingStyles: string
  origin: string
  transformRequest?: (
    request: Request,
    env: Env,
    fragmentConfig: FragmentConfig<Env>
  ) => Request
}

export class PiercingGateway<Env> {
  private fragmentConfigs: Map<string, FragmentConfig<Env>> = new Map()
  constructor() {}

  registerFragment(fragmentConfig: FragmentConfig<Env>) {
    if (this.fragmentConfigs.has(fragmentConfig.fragmentId)) {
      console.warn('Duplicated: ', fragmentConfig.fragmentId)
      return
    }
    this.fragmentConfigs.set(fragmentConfig.fragmentId, fragmentConfig)
  }

  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'GET,OPTIONS'
        }
      })
    }
    const fragmentResponse = await this.handleFragmentFetch(request, env)
    if (fragmentResponse) return fragmentResponse

    return new Response(null, { status: 404 })
  }

  private async handleFragmentFetch(
    request: Request,
    env: Env
  ): Promise<Response | null> {
    const match = request.url.match(
      /^https?:\/\/[^/]*\/piercing-fragment\/([^?/]+)\/?(?:\?.+)?/
    )

    if (match?.length !== 2) return null

    const fragmentId = match[1]
    const fragmentConfig = this.fragmentConfigs.get(fragmentId)
    if (!fragmentConfig) {
      return new Response(
        `<p style="color: red;">configuration for fragment with id "${match[1]}" not found` +
          ' did you remember to register the fragment in the gateway?</p>'
      )
    }

    const fragmentStream = await this.fetchSSRedFragment(
      env,
      fragmentConfig,
      request,
      false
    )

    return new Response(fragmentStream, {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET,OPTIONS'
      }
    })
  }

  private async fetchSSRedFragment(
    env: Env,
    fragmentConfig: FragmentConfig<Env>,
    request: Request,
    prePiercing = true
  ): Promise<ReadableStream> {
    const newRequest = this.getRequestForFragment(request, fragmentConfig, env)

    const response = await fetch(newRequest)
    let fragmentStream = response.body!

    const prePiercingStyles = prePiercing
      ? `<style>${fragmentConfig.prePiercingStyles}</style>`
      : ``

    let template = `
      <piercing-fragment-host fragment-id=${fragmentConfig.fragmentId}>
        ${prePiercingStyles}
        --FRAGMENT_CONTENT--
      </piercing-fragment-host>
    `

    const [preFragment, postFragment] = template.split('--FRAGMENT_CONTENT--')
    return wrapStreamInText(preFragment, postFragment, fragmentStream)
  }

  private getRequestForFragment(
    request: Request,
    fragmentConfig: FragmentConfig<Env>,
    env: Env
  ) {
    const url = new URL(
      request.url
        .replace(/^https?:\/\/[^/]*/, fragmentConfig.origin)
        .replace(`/piercing-fragment/${fragmentConfig.fragmentId}`, '')
    )

    const transformRequest =
      fragmentConfig.transformRequest ?? ((request: Request) => request)

    return transformRequest(new Request(url, request), env, fragmentConfig)
  }
}
