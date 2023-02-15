import { PiercingGateway } from 'piercing-library'

export interface Env {}

const gateway = new PiercingGateway<Env>()
gateway.registerFragment({
  fragmentId: 'fundings',
  origin: 'http://127.0.0.1:3001',
  prePiercingStyles: `
    :not(piercing-fragment-outlet) > piercing-fragment-host {
      display: none;
    }
  `,
  transformRequest: (request) => {
    const url = new URL(request.url)
    url.pathname = '/fundings/6580009205965'
    return new Request(
      // new URL(request.url.replace(/\/product\//, '/fundings/')),
      url,
      request
    )
  }
})

export default gateway
