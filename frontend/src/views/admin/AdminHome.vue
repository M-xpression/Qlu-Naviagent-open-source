<template>
  <AdminLayout>
    <h1>管理中心</h1>
    <div class="stat-cards">
      <div class="admin-stat">
        <span class="as-num">{{ hotspotCount }}</span>
        <span class="as-label">地图热点</span>
      </div>
      <div class="admin-stat">
        <span class="as-num">{{ knowledgeCount }}</span>
        <span class="as-label">知识条目</span>
      </div>
      <div class="admin-stat">
        <span class="as-num">{{ msgCount }}</span>
        <span class="as-label">对话消息</span>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { useMapStore } from '@/stores/map'
import { useChatStore } from '@/stores/chat'
import { useKnowledgeStore } from '@/stores/knowledge'

const mapStore = useMapStore()
const chatStore = useChatStore()
const knowledgeStore = useKnowledgeStore()

// 确保 store 加载完毕后显示准确数字
const hotspotCount = computed(() => mapStore.allHotspots.length)
const knowledgeCount = computed(() => knowledgeStore.allItems.length)
const msgCount = computed(() => chatStore.messages.length)
</script>

<style scoped>
.stat-cards { display: flex; gap: 20px; margin-top: 24px; flex-wrap: wrap; }
.admin-stat {
  background: #fff;
  padding: 24px 32px;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.as-num { font-size: 32px; font-weight: 800; color: var(--primary); }
.as-label { font-size: 14px; color: var(--text-light); }
</style>
