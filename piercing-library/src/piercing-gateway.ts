import { concatenateStreams, wrapStreamInText } from './stream-utilities'
import { piercingFragmentHostInlineScript } from './index'

export interface FragmentConfig<Env> {
  fragmentId: string
  prePiercingStyles: string
  transformRequest?: (
    request: Request,
    env: Env,
    fragmentConfig: FragmentConfig<Env>
  ) => Request
  shouldBeIncluded: (
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ) => boolean | Promise<boolean>
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

  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const fragmentResponse = await this.handleFragmentFetch(request, env)
    if (fragmentResponse) return fragmentResponse

    const fragmentAssetResponse = await this.handleFragmentAssetFetch(
      request,
      env
    )
    if (fragmentAssetResponse) return fragmentAssetResponse

    const htmlResponse = await this.handleHtmlRequest(request, env, ctx)
    if (htmlResponse) return htmlResponse

    return this.forwardFetchToBaseApp(request)
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
        'content-type': 'text/html;charset=UTF-8'
      }
    })
  }

  private async handleFragmentAssetFetch(request: Request, env: Env) {
    const url = new URL(request.url)
    const match = url.pathname.match(/^\/_fragments(\/.+)$/)

    if (match?.length !== 2) return null
    url.pathname = url.pathname.replace(/^\/_fragments\//, '/')
    // @ts-expect-error
    const service = env[`fragment-service`]
    return service.fetch(new Request(url, request))
  }

  private async handleHtmlRequest(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ) {
    const requestIsForHtml = request.headers
      .get('Accept')
      ?.includes('text/html')
    if (!requestIsForHtml) return null

    const indexBodyResponse = this.fetchBaseIndexHtml(
      this.forwardToBaseAppRequest(request)
    ).then((response) => response.text())
    const fragmentStreamOrNullPromises = Array.from(
      this.fragmentConfigs.values()
    ).map(async (fragmentConfig) => {
      const shouldBeIncluded = await fragmentConfig.shouldBeIncluded(
        request,
        env,
        ctx
      )

      return shouldBeIncluded
        ? this.fetchSSRedFragment(env, fragmentConfig, request)
        : null
    })
    const [indexBody, ...fragmentStreamsOrNulls] = await Promise.all([
      indexBodyResponse,
      ...fragmentStreamOrNullPromises
    ])

    const fragmentStreamsToInclude = fragmentStreamsOrNulls.filter(
      (streamOrNull): streamOrNull is ReadableStream<any> =>
        streamOrNull !== null
    )

    return this.returnCombinedIndexPage(
      indexBody,
      concatenateStreams(fragmentStreamsToInclude)
    )
  }

  private forwardFetchToBaseApp(request: Request) {
    return fetch(this.forwardToBaseAppRequest(request))
  }

  private forwardToBaseAppRequest(request: Request) {
    const url = new URL(request.url)
    url.host = 'localhost'
    url.protocol = 'http:'
    url.port = '3002'

    return new Request(url, request)
  }

  private async fetchBaseIndexHtml(request: Request) {
    const response = await fetch(request)

    const requestIsForHtml = request.headers
      .get('Accept')
      ?.includes('text/html')
    if (requestIsForHtml) {
      let indexBody = (await response.text()).replace(
        '</head>',
        `${piercingFragmentHostInlineScript}\n` + '</head>'
      )

      return new Response(indexBody, response)
    }

    return response
  }

  private async fetchSSRedFragment(
    env: Env,
    fragmentConfig: FragmentConfig<Env>,
    request: Request,
    prePiercing = true
  ): Promise<ReadableStream> {
    // @ts-expect-error
    const service = env[`fragment-service`]
    const newRequest = this.getRequestForFragment(request, fragmentConfig, env)

    const response = await service.fetch(newRequest)
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

  private async returnCombinedIndexPage(
    indexBody: string,
    streamToInclude: ReadableStream
  ): Promise<Response> {
    const indexOfEndBody = indexBody.indexOf('</body>')
    const preStream = indexBody.substring(0, indexOfEndBody)
    const postStream = indexBody.substring(indexOfEndBody)

    const stream = wrapStreamInText(preStream, postStream, streamToInclude)

    return new Response(stream, {
      headers: {
        'content-type': 'text/html;charset=UTF-8'
      }
    })
  }

  private getRequestForFragment(
    request: Request,
    fragmentConfig: FragmentConfig<Env>,
    env: Env
  ) {
    const url = new URL(
      request.url.replace(`/piercing-fragment/${fragmentConfig.fragmentId}`, '')
    )

    const transformRequest =
      fragmentConfig.transformRequest ?? ((request: Request) => request)

    return transformRequest(new Request(url, request), env, fragmentConfig)
  }
}
