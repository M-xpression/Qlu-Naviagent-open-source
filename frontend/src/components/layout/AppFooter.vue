<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <span class="footer-text">© {{ new Date().getFullYear() }} 齐鲁工业大学 校园智能导览 · 非官方学生作品</span>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  border-top: 1px solid var(--border);
  background: #fff;
  padding: 20px 0;
  margin-top: auto;
}
.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  text-align: center;
}
.footer-text {
  font-size: 13px;
  color: var(--text-light);
}
</style>
