<template>
  <div class="app-shell">
    <AppHeader />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.main-content {
  flex: 1;
  padding-top: 64px;
  padding-top: calc(64px + env(safe-area-inset-top, 0px));
}

@media (max-width: 768px) {
  .main-content { padding-top: 56px; padding-top: calc(56px + env(safe-area-inset-top, 0px)); }
}
</style>
