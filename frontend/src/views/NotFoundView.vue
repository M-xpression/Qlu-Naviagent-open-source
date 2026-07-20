<template>
  <div class="not-found">
    <div class="nf-content">
      <h1>404</h1>
      <p>页面走丢了</p>
      <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
}
.nf-content { text-align: center; }
.nf-content h1 {
  font-size: 120px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary-dark), var(--primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.nf-content p { font-size: 20px; color: var(--text-light); margin: 16px 0 32px; }
</style>
