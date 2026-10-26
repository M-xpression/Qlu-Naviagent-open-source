// Cloudflare Worker：托管前端静态资源 + 代理智谱AI（服务端转发，避免浏览器跨域、隐藏 key）
export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    // /zhipu/* -> https://open.bigmodel.cn/api/paas/v4/*
    if (url.pathname.startsWith('/zhipu/')) {
      const upstream =
        'https://open.bigmodel.cn/api/paas/v4/' +
        url.pathname.slice('/zhipu/'.length) +
        url.search

      const headers = new Headers(request.headers)
      headers.set('Host', 'open.bigmodel.cn')
      // key 直接写在这里（最简单）；若以后加了 Cloudflare 密钥 ZHIPU_API_KEY，会自动优先用它
      headers.set('Authorization', `Bearer ${env.ZHIPU_API_KEY || '2d875932012e4762be629a309ef8efdd.emRFWOmJ7NBb1jE6'}`)

      return fetch(upstream, {
        method: request.method,
        headers,
        body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
      })
    }

    // 其余请求走静态资源（Vue 前端）
    return env.ASSETS.fetch(request)
  },
}
