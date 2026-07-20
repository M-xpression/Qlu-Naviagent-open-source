<template>
  <AdminLayout>
    <div class="page-top">
      <h1>地图热点管理</h1>
      <div class="top-actions">
        <el-button size="small" @click="store.exportJSON()">📥 导出JSON</el-button>
        <el-button size="small" @click="triggerImport">📤 导入JSON</el-button>
        <input ref="fileInput" type="file" accept=".json" style="display:none" @change="onImportFile" />
        <el-button type="primary" @click="openAdd">+ 添加热点</el-button>
      </div>
    </div>

    <el-table :data="store.allHotspots" border stripe style="width:100%; margin-top:20px">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="名称" width="140" />
      <el-table-column label="分类" width="100">
        <template #default="{ row }">{{ categoryLabel(row.category) }}</template>
      </el-table-column>
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column prop="xPercent" label="X%" width="80" />
      <el-table-column prop="yPercent" label="Y%" width="80" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="del(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑热点' : '添加热点'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.category">
            <el-option v-for="c in categories" :key="c.key" :label="c.label" :value="c.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="简介"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="开放时间"><el-input v-model="form.openTime" placeholder="如 7:00-22:00" /></el-form-item>
        <el-form-item label="X坐标%"><el-input-number v-model="form.xPercent" :min="0" :max="100" :precision="1" /></el-form-item>
        <el-form-item label="Y坐标%"><el-input-number v-model="form.yPercent" :min="0" :max="100" :precision="1" /></el-form-item>
        <el-form-item label="是否发布"><el-switch v-model="form.isPublished" /></el-form-item>
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
import { useMapStore } from '@/stores/map'

const store = useMapStore()
const dialogVisible = ref(false)
const isEdit = ref(false)
const formId = ref(null)

const categories = [
  { key: 'teaching', label: '教学楼' }, { key: 'dining', label: '食堂' },
  { key: 'dormitory', label: '宿舍' }, { key: 'library', label: '图书馆' },
  { key: 'sports', label: '运动场' }, { key: 'admin', label: '行政楼' },
  { key: 'service', label: '生活服务' }, { key: 'other', label: '其他' }
]
const categoryLabel = (cat) => categories.find(c => c.key === cat)?.label || cat

const emptyForm = () => ({ name: '', category: 'teaching', description: '', openTime: '', xPercent: 50, yPercent: 50, isPublished: true })
const form = ref(emptyForm())
const fileInput = ref(null)

const triggerImport = () => fileInput.value?.click()
const onImportFile = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    if (store.importJSON(reader.result)) {
      ElMessage.success('导入成功！刷新地图页即可看到')
    } else {
      ElMessage.error('文件格式错误')
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}

const openAdd = () => { isEdit.value = false; formId.value = null; form.value = emptyForm(); dialogVisible.value = true }
const openEdit = (row) => { isEdit.value = true; formId.value = row.id; form.value = { ...row }; dialogVisible.value = true }
const save = () => {
  if (!form.value.name.trim()) { ElMessage.warning('请输入名称'); return }
  const data = { ...form.value, xPercent: Number(form.value.xPercent), yPercent: Number(form.value.yPercent) }
  if (isEdit.value) { store.updateHotspot({ id: formId.value, ...data }); ElMessage.success('更新成功') }
  else { store.addHotspot(data); ElMessage.success('添加成功') }
  dialogVisible.value = false
}
const del = async (id) => {
  try { await ElMessageBox.confirm('确定删除？', '提示', { type: 'warning' }); store.removeHotspot(id); ElMessage.success('已删除') }
  catch {}
}
</script>

<style scoped>
.page-top { display: flex; justify-content: space-between; align-items: center; }
.top-actions { display: flex; gap: 8px; }
</style>
