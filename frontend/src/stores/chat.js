import { defineStore } from 'pinia'

// 不持久化 — 每人打开都是全新对话，互不干扰
export const useChatStore = defineStore('chat', () => {
  const messages = ref([])
  const streaming = ref(false)
  const currentReply = ref('')

  const suggestions = [
    '图书馆的开放时间是几点？',
    '宿舍条件怎么样？有空调吗？',
    '食堂有哪些？价格贵吗？',
    '怎么从济南西站到长清校区？',
    '大一能考英语四级吗？',
    '学校有哪些社团？'
  ]

  const addMessage = (role, content) => {
    messages.value.push({ role, content, time: Date.now() })
  }

  const startStreaming = () => {
    streaming.value = true
    currentReply.value = ''
  }

  const appendToken = (token) => {
    currentReply.value += token
  }

  const finishStreaming = () => {
    if (currentReply.value) {
      addMessage('assistant', currentReply.value)
    }
    streaming.value = false
    currentReply.value = ''
  }

  const clearMessages = () => {
    messages.value = []
  }

  // 最近10轮用于API调用
  const recentMessages = computed(() => {
    return messages.value.slice(-20)
  })

  return {
    messages, streaming, currentReply, suggestions, recentMessages,
    addMessage, startStreaming, appendToken, finishStreaming, clearMessages
  }
})
