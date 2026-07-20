<template>
  <div class="admin-page">
    <aside class="admin-sidebar">
      <h2>管理后台</h2>
      <router-link to="/admin" class="admin-nav-item" exact-active-class="active">🏠 概览</router-link>
      <router-link to="/admin/hotspots" class="admin-nav-item" active-class="active">📍 地图热点</router-link>
      <router-link to="/admin/knowledge" class="admin-nav-item" active-class="active">📚 知识库</router-link>
    </aside>
    <div class="admin-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.admin-page { display: flex; min-height: calc(100dvh - 64px); min-height: calc(100vh - 64px); }
@media (max-width: 768px) { .admin-page { flex-direction: column; } .admin-sidebar { width: 100%; } }
.admin-sidebar {
  width: 220px; background: #fff; border-right: 1px solid var(--border);
  padding: 24px 0; flex-shrink: 0;
}
.admin-sidebar h2 { padding: 0 20px 16px; font-size: 18px; }
.admin-nav-item {
  display: block; padding: 12px 20px; font-size: 14px;
  color: var(--text); text-decoration: none;
}
.admin-nav-item:hover { background: rgba(26,111,181,0.04); }
.admin-nav-item.active { background: rgba(26,111,181,0.1); color: var(--primary); font-weight: 600; }
.admin-content { flex: 1; padding: 32px; overflow: auto; }
</style>
