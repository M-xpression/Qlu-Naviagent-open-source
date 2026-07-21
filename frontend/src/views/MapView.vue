<template>
  <div class="map-page">
    <!-- 顶部工具栏 -->
    <div class="map-toolbar">
      <div class="toolbar-inner">
        <div class="category-filters">
          <button v-for="c in store.categories" :key="c.key" class="cat-btn"
            :class="{ active: store.activeCategory === c.key }"
            @click="store.activeCategory = c.key">
            <span class="cat-icon">{{ c.icon }}</span>
            <span class="cat-label">{{ c.label }}</span>
          </button>
        </div>
        <div class="search-box">
          <el-input v-model="store.searchText" placeholder="搜索建筑、地点..." :prefix-icon="Search"
            clearable size="large" class="search-input" />
        </div>
      </div>
    </div>

    <div class="map-main">
      <!-- 侧边列表 -->
      <transition name="slide">
        <div class="hotspot-sidebar" :class="{ open: showSidebar }" v-if="showSidebar">
          <div class="sidebar-header">
            <span>校园建筑列表</span>
            <el-button :icon="Close" circle size="small" @click="showSidebar = false" />
          </div>
          <div class="sidebar-list">
            <div v-for="h in store.filteredHotspots" :key="h.id" class="sidebar-item"
              :class="{ active: store.selectedHotspot?.id === h.id }" @click="onHotspotClick(h)">
              <span class="si-cat">{{ categoryIcon(h.category) }}</span>
              <span class="si-name">{{ h.name }}</span>
              <span class="si-cat-label">{{ categoryLabel(h.category) }}</span>
            </div>
          </div>
          <div class="sidebar-footer">
            <span class="sf-count">共 {{ store.filteredHotspots.length }} 个地点</span>
          </div>
        </div>
      </transition>

      <div class="map-wrapper" ref="mapWrapper">
        <div class="map-controls">
          <el-button-group>
            <el-button :icon="ZoomIn" @click="zoomIn" />
            <el-button :icon="ZoomOut" @click="zoomOut" />
            <el-button :icon="FullScreen" @click="resetView" />
          </el-button-group>
          <el-button class="hotspot-list-btn" @click="showSidebar = !showSidebar">
            <el-icon><List /></el-icon>
          </el-button>
        </div>

        <!-- 坐标指示器 -->
        <div class="coord-indicator" v-show="coordVisible">
          X: {{ coordX }}% &nbsp; Y: {{ coordY }}%
        </div>

        <div class="map-canvas" ref="mapCanvas"
          @wheel.prevent="onWheel"
          @mousedown.prevent="onCanvasMouseDown" @mousemove="onMouseMove"
          @mouseup="onMouseUp" @mouseleave="onMouseUp"
          @touchstart.prevent="onCanvasTouchStart" @touchmove.prevent="onTouchMove" @touchend="onTouchEnd">

          <!-- loading -->
          <div class="map-loading" v-if="!imgLoaded">
            <div class="loading-spinner"></div>
            <span>加载地图中...</span>
          </div>
          <!-- map-inner = 图片原始尺寸，通过 transform 缩放平移 -->
          <div class="map-inner" :style="mapTransform" ref="mapInner" v-show="imgLoaded">
            <img src="/map/changqing-campus.jpg" alt="长清校区平面图"
              class="campus-map-img" draggable="false" ref="mapImg" @load="onImageLoad" />

            <!-- 热点层：图片加载完成后才显示 -->
            <div class="hotspot-layer" v-show="imgLoaded">
              <div v-for="h in store.filteredHotspots" :key="h.id" class="hotspot-dot"
                :class="['cat-' + h.category, { active: store.selectedHotspot?.id === h.id }]"
                :style="{ left: h.xPercent + '%', top: h.yPercent + '%', transform: `translate(-50%, -50%) scale(${scale > 0.05 ? 1/scale : 1})` }"
                @mousedown.stop @click.stop="onHotspotClick(h)">
                <div class="dot-inner"><span>{{ categoryIcon(h.category) }}</span></div>
                <span class="dot-label">{{ h.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 热点详情卡片 -->
      <transition name="slide-up">
        <div class="hotspot-card" v-if="store.selectedHotspot">
          <div class="hc-header">
            <span class="hc-cat">{{ categoryIcon(store.selectedHotspot.category) }}</span>
            <div class="hc-title-row">
              <h3>{{ store.selectedHotspot.name }}</h3>
              <span class="hc-cat-tag">{{ categoryLabel(store.selectedHotspot.category) }}</span>
            </div>
            <el-button :icon="Close" circle size="small" @click="store.selectedHotspot = null" />
          </div>
          <div class="hc-body">
            <p v-if="store.selectedHotspot.description">{{ store.selectedHotspot.description }}</p>
            <div class="hc-meta" v-if="store.selectedHotspot.openTime">
              <el-icon><Clock /></el-icon><span>{{ store.selectedHotspot.openTime }}</span>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search, ZoomIn, ZoomOut, FullScreen, Close, Clock, List } from '@element-plus/icons-vue'
import { useMapStore } from '@/stores/map'

const store = useMapStore()
const showSidebar = ref(false)

// ===== 图片和缩放/拖拽 =====
const mapWrapper = ref(null)
const mapCanvas = ref(null)
const mapInner = ref(null)
const mapImg = ref(null)
const imgLoaded = ref(false)
const imgW = ref(1)
const imgH = ref(1)

const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragStartTX = ref(0)
const dragStartTY = ref(0)
const lastTouchDistance = ref(0)
const lastTouchScale = ref(1)
let velocityX = 0, velocityY = 0
let lastMoveTime = 0, lastMoveX = 0, lastMoveY = 0
let inertiaTimer = null

const coordVisible = ref(false)
const coordX = ref(0)
const coordY = ref(0)

// 初始化：图片加载后，计算居中缩放
function onImageLoad() {
  const img = mapImg.value
  imgW.value = img.naturalWidth || 1
  imgH.value = img.naturalHeight || 1
  imgLoaded.value = true
  recenterImage()
  window.addEventListener('resize', recenterImage)
}

function recenterImage() {
  const cw = mapCanvas.value?.clientWidth || window.innerWidth
  const ch = mapCanvas.value?.clientHeight || window.innerHeight - 120
  const s = Math.max(0.2, Math.min(3, Math.min(cw / imgW.value, ch / imgH.value)))
  scale.value = s
  translateX.value = (cw - imgW.value * s) / 2
  translateY.value = (ch - imgH.value * s) / 2
}

function clampTranslate() {
  const cw = mapCanvas.value?.clientWidth || 1
  const ch = mapCanvas.value?.clientHeight || 1
  const iw = imgW.value * scale.value
  const ih = imgH.value * scale.value
  const m = Math.max(iw * 0.3, 200)
  translateX.value = Math.max(-iw + cw - m, Math.min(m, translateX.value))
  translateY.value = Math.max(-ih + ch - m, Math.min(m, translateY.value))
}

const mapTransform = computed(() => ({
  width: imgW.value + 'px',
  height: imgH.value + 'px',
  transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`,
  transformOrigin: '0 0'
}))

const clampScale = (v) => Math.max(0.2, Math.min(3, v))
const zoomIn = () => { scale.value = Math.min(scale.value + 0.3, 3); clampTranslate() }
const zoomOut = () => { scale.value = Math.max(scale.value - 0.3, 0.2); clampTranslate() }
const resetView = () => recenterImage()

// 坐标：屏幕点 → 反算变换 → 图片百分比
function screenToImagePercent(clientX, clientY) {
  const rect = mapCanvas.value.getBoundingClientRect()
  const sx = clientX - rect.left
  const sy = clientY - rect.top
  const px = (sx - translateX.value) / scale.value / imgW.value * 100
  const py = (sy - translateY.value) / scale.value / imgH.value * 100
  return { x: parseFloat(px.toFixed(1)), y: parseFloat(py.toFixed(1)) }
}

function applyInertia() {
  if (Math.abs(velocityX) < 0.5 && Math.abs(velocityY) < 0.5) return
  translateX.value += velocityX; translateY.value += velocityY
  velocityX *= 0.92; velocityY *= 0.92
  clampTranslate()
  inertiaTimer = requestAnimationFrame(applyInertia)
}
function stopInertia() {
  if (inertiaTimer) { cancelAnimationFrame(inertiaTimer); inertiaTimer = null }
  velocityX = 0; velocityY = 0
}

// ===== 鼠标/触摸事件 =====
// 点击地图空白处关闭所有弹窗
const onCanvasMouseDown = (e) => {
  // 关闭侧边栏和热点卡片
  showSidebar.value = false
  store.selectedHotspot = null
  // 继续正常的拖拽逻辑
  onMouseDown(e)
}
const onCanvasTouchStart = (e) => {
  showSidebar.value = false
  store.selectedHotspot = null
  onTouchStart(e)
}

let moveStartTime = 0
const onMouseDown = (e) => {
  stopInertia()
  isDragging.value = true
  moveStartTime = Date.now()
  dragStartX.value = e.clientX
  dragStartY.value = e.clientY
  dragStartTX.value = translateX.value
  dragStartTY.value = translateY.value
  lastMoveTime = Date.now()
  lastMoveX = e.clientX
  lastMoveY = e.clientY
}

const onMouseMove = (e) => {
  if (imgW.value > 1) {
    const p = screenToImagePercent(e.clientX, e.clientY)
    coordX.value = p.x
    coordY.value = p.y
  }
  coordVisible.value = true

  if (!isDragging.value) return
  const now = Date.now()
  translateX.value = dragStartTX.value + (e.clientX - dragStartX.value)
  translateY.value = dragStartTY.value + (e.clientY - dragStartY.value)
  clampTranslate()
  // 计算惯性速度
  const dt = now - lastMoveTime
  if (dt > 0) {
    velocityX = (e.clientX - lastMoveX) / dt * 8
    velocityY = (e.clientY - lastMoveY) / dt * 8
  }
  lastMoveTime = now
  lastMoveX = e.clientX
  lastMoveY = e.clientY
}

const onMouseUp = () => {
  isDragging.value = false
  coordVisible.value = false
  // 短距离拖动不触发惯性
  if (Math.abs(velocityX) < 1 && Math.abs(velocityY) < 1) return
  applyInertia()
}

const onWheel = (e) => {
  stopInertia()
  const rect = mapCanvas.value.getBoundingClientRect()
  const mx = e.clientX - rect.left
  const my = e.clientY - rect.top
  const delta = e.deltaY > 0 ? -0.15 : 0.15
  const newScale = clampScale(scale.value + delta)
  translateX.value = mx - (mx - translateX.value) * (newScale / scale.value)
  translateY.value = my - (my - translateY.value) * (newScale / scale.value)
  scale.value = newScale
  clampTranslate()
}

const onTouchStart = (e) => {
  stopInertia()
  if (e.touches.length === 1) {
    isDragging.value = true
    moveStartTime = Date.now()
    dragStartX.value = e.touches[0].clientX
    dragStartY.value = e.touches[0].clientY
    dragStartTX.value = translateX.value
    dragStartTY.value = translateY.value
    lastMoveTime = Date.now()
    lastMoveX = e.touches[0].clientX
    lastMoveY = e.touches[0].clientY
  } else if (e.touches.length === 2) {
    isDragging.value = false
    const dx = e.touches[0].clientX - e.touches[1].clientX
    const dy = e.touches[0].clientY - e.touches[1].clientY
    lastTouchDistance.value = Math.sqrt(dx * dx + dy * dy)
    lastTouchScale.value = scale.value
  }
}

const onTouchMove = (e) => {
  if (imgW.value > 1 && e.touches.length === 1) {
    const p = screenToImagePercent(e.touches[0].clientX, e.touches[0].clientY)
    coordX.value = p.x; coordY.value = p.y; coordVisible.value = true
  }
  if (e.touches.length === 1 && isDragging.value) {
    const now = Date.now()
    translateX.value = dragStartTX.value + (e.touches[0].clientX - dragStartX.value)
    translateY.value = dragStartTY.value + (e.touches[0].clientY - dragStartY.value)
    clampTranslate()
    const dt = now - lastMoveTime
    if (dt > 0) {
      velocityX = (e.touches[0].clientX - lastMoveX) / dt * 8
      velocityY = (e.touches[0].clientY - lastMoveY) / dt * 8
    }
    lastMoveTime = now
    lastMoveX = e.touches[0].clientX
    lastMoveY = e.touches[0].clientY
  } else if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX
    const dy = e.touches[0].clientY - e.touches[1].clientY
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (lastTouchDistance.value > 0) {
      scale.value = clampScale(lastTouchScale.value * (dist / lastTouchDistance.value))
      clampTranslate()
    }
  }
}

const onTouchEnd = () => {
  isDragging.value = false
  lastTouchDistance.value = 0
  coordVisible.value = false
  if (Math.abs(velocityX) < 1 && Math.abs(velocityY) < 1) return
  applyInertia()
}

// 数据由 store.initData() 自动从 hotspots-data.json 加载

// ===== 辅助 =====
// 点击热点：选中 + 关闭侧边栏（手机端）
const onHotspotClick = (h) => {
  showSidebar.value = false
  store.selectHotspot(h)
}

const categoryIcon = (cat) => ({ teaching: '🏫', dining: '🍽️', dormitory: '🏠', library: '📚', sports: '⚽', admin: '🏛️', hospital: '🏥', service: '🛒', other: '📍' })[cat] || '📍'
const categoryLabel = (cat) => ({ teaching: '教学楼', dining: '食堂', dormitory: '宿舍', library: '图书馆', sports: '运动场', admin: '行政楼', hospital: '校医院', service: '生活服务', other: '其他' })[cat] || ''

</script>

<style scoped>
.map-page { display: flex; flex-direction: column; height: calc(100dvh - 64px); height: calc(100vh - 64px); background: #f0f2f5; }
.map-toolbar { background: #fff; border-bottom: 1px solid var(--border); padding: 12px 20px; flex-shrink: 0; }
.toolbar-inner { max-width: 1400px; margin: 0 auto; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.category-filters { display: flex; gap: 4px; flex-wrap: wrap; }
.cat-btn { display: flex; align-items: center; gap: 4px; padding: 6px 12px; border: 1.5px solid var(--border); border-radius: 20px; background: #fff; font-size: 13px; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
.cat-btn:hover { border-color: var(--primary-light); color: var(--primary); }
.cat-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); }
.cat-icon { font-size: 15px; }
.search-box { width: 220px; }

.map-main { flex: 1; display: flex; overflow: hidden; position: relative; }
.hotspot-sidebar { width: 280px; flex-shrink: 0; background: #fff; border-right: 1px solid var(--border); display: flex; flex-direction: column; }
.sidebar-header { display: flex; justify-content: space-between; align-items: center; padding: 16px; font-weight: 600; border-bottom: 1px solid var(--border); }
.sidebar-list { flex: 1; overflow-y: auto; padding: 8px; }
.sidebar-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; cursor: pointer; transition: all 0.15s; }
.sidebar-item:hover { background: rgba(26,111,181,0.06); }
.sidebar-item.active { background: rgba(26,111,181,0.1); color: var(--primary); }
.si-name { flex: 1; font-size: 14px; font-weight: 500; }
.si-cat-label { font-size: 12px; color: var(--text-light); }
.sidebar-footer { padding: 12px 16px; border-top: 1px solid var(--border); }
.sf-count { font-size: 13px; color: var(--text-light); }

.map-wrapper { flex: 1; position: relative; overflow: hidden; cursor: grab; }
.map-wrapper:active { cursor: grabbing; }
.map-wrapper:active { cursor: grabbing; }
.map-controls { position: absolute; top: 16px; right: 16px; z-index: 10; display: flex; flex-direction: column; gap: 8px; }
.hotspot-list-btn { display: none; }
.coord-indicator { position: absolute; top: 16px; left: 16px; z-index: 10; padding: 8px 16px; background: rgba(0,0,0,0.75); color: #fff; font-size: clamp(13px, 2vw, 16px); font-family: monospace; border-radius: 8px; pointer-events: none; }

.map-loading { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: var(--text-light); font-size: 14px; }
.loading-spinner { width: 36px; height: 36px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.map-canvas { width: 100%; height: 100%; overflow: hidden; touch-action: none; user-select: none; -webkit-user-select: none; }
.map-inner { position: absolute; top: 0; left: 0; }
.campus-map-img { width: 100%; height: 100%; display: block; user-select: none; pointer-events: none; }

/* 热点层 — 和图片完美对齐 */
.hotspot-layer { position: absolute; inset: 0; pointer-events: none; }
.hotspot-dot { position: absolute; transform: translate(-50%, -50%); pointer-events: auto; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px; z-index: 1; }
.hotspot-dot:hover { z-index: 10; }
.dot-inner {
  width: 44px; height: 44px;
  border-radius: 50%;
  background: rgba(255,255,255,0.95);
  border: 3px solid var(--primary);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.18);
  transition: all 0.15s ease;
}
.hotspot-dot:hover .dot-inner, .hotspot-dot.active .dot-inner {
  transform: scale(1.12);
  border-color: var(--accent);
  border-width: 4px;
  box-shadow: 0 4px 20px rgba(240,160,48,0.4);
  z-index: 20;
  background: #fff;
}
.dot-label {
  font-size: 13px; font-weight: 700;
  color: #222;
  background: rgba(255,255,255,0.94);
  padding: 3px 8px;
  border-radius: 4px;
  white-space: nowrap;
  box-shadow: 0 1px 5px rgba(0,0,0,0.13);
}
@media (max-width: 768px) {
  .dot-inner { width: 38px; height: 38px; font-size: 17px; border-width: 2.5px; }
  .dot-label { font-size: 11px; padding: 2px 6px; }
}
.hotspot-dot.cat-dining .dot-inner { border-color: #e67e22; }
.hotspot-dot.cat-dormitory .dot-inner { border-color: #9b59b6; }
.hotspot-dot.cat-library .dot-inner { border-color: #2ecc71; }
.hotspot-dot.cat-sports .dot-inner { border-color: #1abc9c; }
.hotspot-dot.cat-admin .dot-inner { border-color: #34495e; }
.hotspot-dot.cat-service .dot-inner { border-color: #e74c3c; }

/* 热点详情卡片 */
.hotspot-card { position: absolute; bottom: 80px; left: 50%; transform: translateX(-50%); width: 90%; max-width: 500px; background: #fff; border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,0.15); z-index: 200; overflow: hidden; }
.hc-header { display: flex; align-items: flex-start; gap: 12px; padding: 16px 20px; border-bottom: 1px solid var(--border); }
.hc-cat { font-size: 24px; }
.hc-title-row { flex: 1; }
.hc-title-row h3 { font-size: 18px; font-weight: 700; }
.hc-cat-tag { font-size: 12px; color: var(--primary); background: rgba(26,111,181,0.08); padding: 2px 8px; border-radius: 4px; }
.hc-body { padding: 16px 20px; }
.hc-body p { font-size: 14px; color: var(--text-light); line-height: 1.7; }
.hc-meta { display: flex; align-items: center; gap: 6px; margin-top: 12px; font-size: 13px; color: var(--text-light); }

/* 过渡 */
.slide-enter-active, .slide-leave-active { transition: transform 0.3s ease, opacity 0.3s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(-100%); opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateX(-50%) translateY(20px); }

@media (max-width: 768px) {
  .hotspot-sidebar { position: fixed !important; left: 0; top: 0; bottom: 0; z-index: 999; width: 280px; transform: translateX(-100%); transition: transform 0.3s ease; }
  .hotspot-sidebar.open { transform: translateX(0); }
  .hotspot-list-btn { display: flex !important; }
  .cat-btn { padding: 4px 8px; font-size: 12px; }
  .cat-label { display: none; }
  .category-filters { gap: 2px; }
  .search-box { width: 160px; }
}
</style>
