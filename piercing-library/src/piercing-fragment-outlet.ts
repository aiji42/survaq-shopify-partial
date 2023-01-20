import WritableDOMStream from 'writable-dom'
import type { PiercingFragmentHost } from './piercing-fragment-host'

/**
 * Set of ids of fragments that have been previously unmounted.
 *
 * We keep track of this to know whether to manually run side-effects in modules
 * that are referenced as part of the fragment.
 *
 * When we fetch a fragment for the first time any side-effects in module-type scripts
 * that are referenced will be executed.
 * Later, if we fetch the fragment again, its side-effects will not run automatically.
 * To workaround this we ensure that all such modules also expose their side-effects
 * via a default export function.
 * We then manually call that default export to re-execute the side-effects.
 */
const unmountedFragmentIds: Set<string> = new Set()

export class PiercingFragmentOutlet extends HTMLElement {
  private readonly piercingFragmentOutlet = true
  private fragmentHost: PiercingFragmentHost | null = null

  async connectedCallback() {
    const fragmentId = this.getAttribute('fragment-id')

    if (!fragmentId) {
      throw new Error(
        'The fragment outlet component has been applied without' +
          ' providing a fragment-id'
      )
    }

    this.fragmentHost = this.getFragmentHost(fragmentId)

    if (this.fragmentHost) {
      // There is already a fragment host in the DOM that we can pierce into this outlet
      this.innerHTML = ''
      this.fragmentHost.pierceInto(this)
    } else {
      // We need to fetch and create the fragment host
      const fragmentStream = await this.fetchFragmentStream(fragmentId)
      await this.streamFragmentIntoOutlet(fragmentId, fragmentStream)
      this.fragmentHost = this.getFragmentHost(fragmentId, true)
    }

    if (!this.fragmentHost) {
      throw new Error(
        `The fragment with id "${fragmentId}" is not present and` +
          ' it could not be fetched'
      )
    }
  }

  disconnectedCallback() {
    if (this.fragmentHost) {
      unmountedFragmentIds.add(this.fragmentHost.fragmentId)
      this.fragmentHost = null
    }
  }

  private async fetchFragmentStream(fragmentId: string) {
    const url = this.getFragmentUrl(fragmentId)

    const response = await fetch(url)
    if (!response.body) {
      throw new Error(
        'An empty response has been provided when fetching' +
          ` the fragment with id ${fragmentId}`
      )
    }
    return response.body
  }

  private getFragmentUrl(fragmentId: string): string {
    return `/_fragments/${fragmentId}`
  }

  private async streamFragmentIntoOutlet(
    fragmentId: string,
    fragmentStream: ReadableStream
  ) {
    await fragmentStream
      .pipeThrough(new TextDecoderStream())
      .pipeTo(new WritableDOMStream(this as ParentNode))

    this.reapplyFragmentModuleScripts(fragmentId)
  }

  private reapplyFragmentModuleScripts(fragmentId: string) {
    if (unmountedFragmentIds.has(fragmentId)) {
      this.querySelectorAll('script').forEach((script) => {
        if (script.src && script.type === 'module') {
          import(/* @vite-ignore */ script.src).then((scriptModule) =>
            scriptModule.default?.()
          )
        }
      })
    }
  }

  private getFragmentHost(
    fragmentId: string,
    insideOutlet = false
  ): PiercingFragmentHost | null {
    return (insideOutlet ? this : document).querySelector(
      `piercing-fragment-host[fragment-id="${fragmentId}"]`
    )
  }
}

export function registerPiercingFragmentOutlet() {
  if (!window.customElements.get('piercing-fragment-outlet')) {
    window.customElements.define(
      'piercing-fragment-outlet',
      PiercingFragmentOutlet
    )
  }
}
