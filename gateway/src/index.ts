import { PiercingGateway } from 'piercing-library'

export interface Env {}

const gateway = new PiercingGateway<Env>()
gateway.registerFragment({
  fragmentId: 'fundings',
  prePiercingStyles: ``,
  shouldBeIncluded: (request, env, ctx) =>
    new URL(request.url).pathname.startsWith('/product/'),
  transformRequest: (request) => {
    return new Request(
      new URL(request.url.replace(/\/product\//, '/fundings/')),
      request
    )
  }
})

export default gateway
