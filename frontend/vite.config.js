import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'
import { writeFileSync } from 'fs'

// 自定义插件：接收前端保存的热点数据，写回 public/hotspots-data.json
function persistHotspots() {
  let dataFile = ''
  return {
    name: 'persist-hotspots',
    configureServer(server) {
      dataFile = resolve(__dirname, 'public/hotspots-data.json')
      server.middlewares.use('/api/save-hotspots', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
        let body = ''
        req.on('data', chunk => body += chunk)
        req.on('end', () => {
          try {
            const data = JSON.parse(body)
            writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf-8')
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(JSON.stringify({ ok: true, count: data.length }))
          } catch (e) {
            res.statusCode = 400
            res.end(JSON.stringify({ ok: false, error: e.message }))
          }
        })
      })
    }
  }
}

export default defineConfig({
  plugins: [
    vue(),
    persistHotspots(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia']
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') }
  },
  server: {
    host: '0.0.0.0',
    port: 4300,
    strictPort: true,
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true }
    }
  }
})
