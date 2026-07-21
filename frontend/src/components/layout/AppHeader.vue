<template>
  <header class="app-header" :class="{ scrolled }">
    <div class="header-inner">
      <router-link to="/" class="logo">
        <img src="/emblem.png" class="logo-icon" alt="校徽" />
        <div class="logo-text">
          <span class="logo-title">齐鲁工业大学</span>
          <span class="logo-subtitle">校园智能导览</span>
        </div>
      </router-link>

      <nav class="nav-links">
        <router-link to="/" class="nav-item" exact-active-class="active">
          <el-icon><HomeFilled /></el-icon>
          <span>校园介绍</span>
        </router-link>
        <router-link to="/map" class="nav-item" active-class="active">
          <el-icon><MapLocation /></el-icon>
          <span>校园地图</span>
        </router-link>
        <router-link to="/chat" class="nav-item" active-class="active">
          <el-icon><ChatDotRound /></el-icon>
          <span>Mars学长</span>
        </router-link>
      </nav>

      <div class="header-actions">
        <el-button class="mobile-menu-btn" :icon="Menu" circle @click="drawer = true" />
      </div>
    </div>

    <!-- 移动端抽屉菜单 -->
    <el-drawer v-model="drawer" direction="rtl" size="280px" :with-header="false" :z-index="9999" append-to-body>
      <div class="drawer-nav">
        <router-link to="/" class="drawer-item" @click="drawer = false">🏫 校园介绍</router-link>
        <router-link to="/map" class="drawer-item" @click="drawer = false">🗺️ 校园地图</router-link>
        <router-link to="/chat" class="drawer-item" @click="drawer = false">🤖 Mars学长</router-link>
      </div>
    </el-drawer>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Menu } from '@element-plus/icons-vue'

const drawer = ref(false)
const scrolled = ref(false)

const onScroll = () => { scrolled.value = window.scrollY > 10 }
onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding-top: env(safe-area-inset-top, 0px);
  border-bottom: 1px solid transparent;
  transition: all 0.3s ease;
}
.app-header.scrolled {
  border-bottom-color: var(--border);
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
}
.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}
.logo-icon {
  width: 36px;
  height: 36px;
  object-fit: contain;
}
.logo-text {
  display: flex;
  flex-direction: column;
}
.logo-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.2;
}
.logo-subtitle {
  font-size: 12px;
  color: var(--text-light);
}
.nav-links {
  display: flex;
  gap: 4px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-light);
  text-decoration: none;
  transition: all 0.2s ease;
}
.nav-item:hover {
  color: var(--primary);
  background: rgba(26, 111, 181, 0.06);
}
.nav-item.active {
  color: var(--primary);
  background: rgba(26, 111, 181, 0.1);
}
.mobile-menu-btn {
  display: none;
}
.drawer-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 0;
}
.drawer-item {
  display: block;
  padding: 14px 20px;
  font-size: 16px;
  font-weight: 500;
  color: var(--text);
  border-radius: 8px;
  transition: all 0.2s ease;
}
.drawer-item:hover {
  background: rgba(26, 111, 181, 0.06);
  color: var(--primary);
}
@media (max-width: 768px) {
  .nav-links { display: none; }
  .mobile-menu-btn { display: inline-flex; }
  .header-inner { height: 48px; }
  .logo-title { font-size: 15px; }
  .logo-subtitle { font-size: 10px; }
  .logo-icon { width: 28px; height: 28px; }
}
</style>
