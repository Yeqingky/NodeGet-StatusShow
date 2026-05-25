import { RpcClient } from './client'

export interface BackendToken {
  name: string
  backend_url: string
  token: string
  order_offset?: number
}

export interface PoolEntry {
  name: string
  order_offset: number
  client: RpcClient
}

export class BackendPool {
  entries: PoolEntry[]

  constructor(tokens: BackendToken[]) {
    this.entries = tokens.map(t => ({
      name: t.name,
      order_offset: t.order_offset ?? 0,
      client: new RpcClient(t.backend_url, t.token, t.name),
    }))
  }

  async fanout<T, A extends unknown[]>(
    method: (client: RpcClient, ...args: A) => Promise<T>,
    ...args: A
  ) {
    const settled = await Promise.allSettled(
      this.entries.map(e => method(e.client, ...args).then(rows => ({ source: e.name, rows }))),
    )
    const ok: { source: string; rows: T }[] = []
    const errors: { source: string; error: unknown }[] = []
    settled.forEach((r, i) => {
      if (r.status === 'fulfilled') ok.push(r.value)
      else errors.push({ source: this.entries[i].name, error: r.reason })
    })
    return { ok, errors }
  }

  close() {
    for (const e of this.entries) e.client.close()
  }
}
