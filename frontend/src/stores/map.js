import { defineStore } from 'pinia'

const STORAGE_KEY = 'qlu-campus-hotspots'
const JSON_FALLBACK_URL = '/hotspots-data.json'

const defaultHotspots = [
  { id: 1, name: '第一教学楼', category: 'teaching', xPercent: 35, yPercent: 30, description: '主要教学楼之一', openTime: '7:00-22:00', images: '[]', isPublished: true },
  { id: 2, name: '第二教学楼', category: 'teaching', xPercent: 45, yPercent: 30, description: '距离食堂最近', openTime: '7:00-22:00', images: '[]', isPublished: true },
  { id: 3, name: '第三教学楼', category: 'teaching', xPercent: 55, yPercent: 30, description: '机电类教学楼', openTime: '7:00-22:00', images: '[]', isPublished: true },
  { id: 4, name: '第一食堂', category: 'dining', xPercent: 40, yPercent: 55, description: '消费较高，平均15-30元', openTime: '6:30-18:30', images: '[]', isPublished: true },
  { id: 5, name: '第二食堂', category: 'dining', xPercent: 50, yPercent: 55, description: '平均消费12-20元', openTime: '6:30-18:30', images: '[]', isPublished: true },
  { id: 6, name: '第三食堂', category: 'dining', xPercent: 60, yPercent: 55, description: '平均消费12-20元', openTime: '6:30-18:30', images: '[]', isPublished: true },
  { id: 7, name: '图书馆', category: 'library', xPercent: 30, yPercent: 40, description: '早6点-晚10点开放，全校第二宏伟建筑', openTime: '6:00-22:00', images: '[]', isPublished: true },
  { id: 8, name: '菜鸟驿站', category: 'service', xPercent: 65, yPercent: 70, description: '全长清最大快递站', openTime: '9:00-19:00', images: '[]', isPublished: true },
  { id: 9, name: '男生宿舍A区', category: 'dormitory', xPercent: 70, yPercent: 45, description: '4-6人间，独立空调', images: '[]', isPublished: true },
  { id: 10, name: '女生宿舍B区', category: 'dormitory', xPercent: 75, yPercent: 38, description: '4-6人间，部分上床下桌', images: '[]', isPublished: true },
  { id: 11, name: '操场', category: 'sports', xPercent: 20, yPercent: 65, description: '标准运动场，晚上有各种活动', images: '[]', isPublished: true },
  { id: 12, name: '行政楼', category: 'admin', xPercent: 48, yPercent: 20, description: '学校行政办公', openTime: '8:00-17:30', images: '[]', isPublished: true }
]

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return null
}

function saveToStorage(hotspots) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hotspots))
  } catch {}
}

export const useMapStore = defineStore('map', () => {
  // 三层加载：localStorage → JSON文件(fetch) → 硬编码默认值
  const hotspots = ref([...defaultHotspots])
  const loaded = ref(false)

  // 加载顺序：JSON文件优先（你的固定版本），其次 localStorage，最后硬编码
  async function initData() {
    // 第一层：public/hotspots-data.json — 你的固定版本，换了任何设备都加载这个
    try {
      const res = await fetch(JSON_FALLBACK_URL, { cache: 'no-cache' })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          hotspots.value = data
          saveToStorage(data)
          loaded.value = true
          return
        }
      }
    } catch {}
    // 第二层：localStorage（管理员编辑过但还没导出）
    const stored = loadFromStorage()
    if (stored) {
      hotspots.value = stored
      loaded.value = true
      return
    }
    // 第三层：硬编码默认值
    loaded.value = true
  }

  // 立即发起加载
  if (typeof window !== 'undefined') {
    initData()
  }

  // 跨标签页同步
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) {
        const updated = loadFromStorage()
        if (updated) hotspots.value = updated
      }
    })
  }

  const activeCategory = ref('all')
  const selectedHotspot = ref(null)
  const searchText = ref('')
  const maxId = ref(defaultHotspots.length + 1)

  const categories = [
    { key: 'all', label: '全部', icon: '📍' },
    { key: 'teaching', label: '教学楼', icon: '🏫' },
    { key: 'dining', label: '食堂', icon: '🍽️' },
    { key: 'dormitory', label: '宿舍', icon: '🏠' },
    { key: 'library', label: '图书馆', icon: '📚' },
    { key: 'sports', label: '运动场', icon: '⚽' },
    { key: 'admin', label: '行政楼', icon: '🏛️' },
    { key: 'service', label: '生活服务', icon: '🛒' },
    { key: 'other', label: '其他', icon: '📍' }
  ]

  const filteredHotspots = computed(() => {
    let list = hotspots.value.filter(h => h.isPublished !== false)
    if (activeCategory.value !== 'all') {
      list = list.filter(h => h.category === activeCategory.value)
    }
    if (searchText.value) {
      const kw = searchText.value.toLowerCase()
      list = list.filter(h => h.name.toLowerCase().includes(kw))
    }
    return list
  })

  const allHotspots = computed(() => hotspots.value)

  const selectHotspot = (h) => {
    selectedHotspot.value = selectedHotspot.value?.id === h.id ? null : h
  }

  const persist = () => {
    saveToStorage(hotspots.value)
    // 同时写回 public/hotspots-data.json（通过 vite 中间件）
    fetch('/api/save-hotspots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hotspots.value)
    }).catch(() => {})
  }

  const addHotspot = (data) => {
    const ids = hotspots.value.map(h => h.id)
    const newId = ids.length > 0 ? Math.max(...ids) + 1 : 1
    const item = { ...data, id: newId, images: data.images || '[]', isPublished: data.isPublished !== false }
    hotspots.value.push(item)
    persist()
  }

  const updateHotspot = (data) => {
    const idx = hotspots.value.findIndex(h => h.id === data.id)
    if (idx !== -1) {
      hotspots.value[idx] = { ...hotspots.value[idx], ...data }
      persist()
      window.dispatchEvent(new CustomEvent('hotspots-changed', { detail: hotspots.value }))
    }
  }

  const removeHotspot = (id) => {
    const idx = hotspots.value.findIndex(h => h.id === id)
    if (idx !== -1) {
      hotspots.value.splice(idx, 1)
      persist()
    }
  }

  // 导出数据为 JSON 文件下载
  const exportJSON = () => {
    const json = JSON.stringify(hotspots.value, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'hotspots-data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // 从 JSON 文件导入
  const importJSON = (jsonStr) => {
    try {
      const data = JSON.parse(jsonStr)
      if (Array.isArray(data) && data.length > 0) {
        hotspots.value = data
        persist()
        return true
      }
    } catch {}
    return false
  }

  return {
    hotspots, activeCategory, selectedHotspot, searchText, loaded,
    categories, filteredHotspots, allHotspots,
    selectHotspot, addHotspot, updateHotspot, removeHotspot,
    exportJSON, importJSON
  }
})
