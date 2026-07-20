<template>
  <AdminLayout>
    <div class="page-top">
      <h1>知识库管理</h1>
      <el-button type="primary" @click="openAdd">+ 添加知识</el-button>
    </div>
    <p class="hint">这些内容会被 Mars 学长引用回答新生问题</p>

    <el-table :data="store.allItems" border stripe style="width:100%; margin-top:20px">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="title" label="标题" width="180" />
      <el-table-column prop="category" label="分类" width="100" />
      <el-table-column prop="keywords" label="关键词" width="150" />
      <el-table-column prop="content" label="内容" show-overflow-tooltip min-width="250" />
      <el-table-column prop="isActive" label="启用" width="60">
        <template #default="{ row }">{{ row.isActive ? '✅' : '❌' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="del(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑知识' : '添加知识'" width="650px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="分类"><el-input v-model="form.category" placeholder="如：生活服务、学习" /></el-form-item>
        <el-form-item label="关键词"><el-input v-model="form.keywords" placeholder="逗号分隔，用于搜索匹配" /></el-form-item>
        <el-form-item label="内容">
          <el-input v-model="form.content" type="textarea" :rows="6" />
        </el-form-item>
        <el-form-item label="来源"><el-input v-model="form.source" placeholder="如：官方、新生攻略" /></el-form-item>
        <el-form-item label="启用"><el-switch v-model="form.isActive" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </AdminLayout>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { useKnowledgeStore } from '@/stores/knowledge'

const store = useKnowledgeStore()
const dialogVisible = ref(false)
const isEdit = ref(false)
const formId = ref(null)
const form = ref({ title: '', category: '', keywords: '', content: '', source: '', isActive: true })

const openAdd = () => {
  isEdit.value = false; formId.value = null
  form.value = { title: '', category: '', keywords: '', content: '', source: '', isActive: true }
  dialogVisible.value = true
}
const openEdit = (row) => {
  isEdit.value = true; formId.value = row.id
  form.value = { ...row }
  dialogVisible.value = true
}
const save = () => {
  if (!form.value.title.trim()) { ElMessage.warning('请输入标题'); return }
  if (isEdit.value) { store.update({ id: formId.value, ...form.value }); ElMessage.success('更新成功') }
  else { store.add({ ...form.value }); ElMessage.success('添加成功') }
  dialogVisible.value = false
}
const del = async (id) => {
  try { await ElMessageBox.confirm('确定删除？', '提示', { type: 'warning' }); store.remove(id); ElMessage.success('已删除') }
  catch {}
}
</script>

<style scoped>
.page-top { display: flex; justify-content: space-between; align-items: center; }
.hint { color: var(--text-light); font-size: 13px; margin-top: 8px; }
</style>
