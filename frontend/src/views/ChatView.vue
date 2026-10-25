<template>
  <div class="chat-page">
    <div class="chat-layout">
      <!-- 欢迎/新会话状态 -->
      <div class="chat-main" :class="{ 'has-messages': store.messages.length > 0 }">
        <div v-if="store.messages.length === 0" class="chat-welcome">
          <div class="welcome-avatar">
            <img src="/mars-avatar.jpg" class="welcome-avatar-img" alt="Mars学长" />
          </div>
          <h1>你好，我是Mars学长</h1>
          <p>齐鲁工业大学的校园百事通，关于学校的一切都可以问我~</p>
          <div class="welcome-suggestions">
            <button
              v-for="s in store.suggestions"
              :key="s"
              class="suggestion-chip"
              @click="sendMessage(s)"
            >
              {{ s }}
            </button>
          </div>
        </div>

        <!-- 对话消息列表 -->
        <div v-else class="chat-messages" ref="messagesContainer">
          <div
            v-for="(msg, i) in store.messages"
            :key="i"
            class="message-row"
            :class="msg.role"
          >
            <div class="msg-avatar">
              <span v-if="msg.role === 'user'">👤</span>
              <img v-else src="/mars-avatar.jpg" class="msg-avatar-img" alt="Mars学长" />
            </div>
            <div class="msg-body">
              <div class="msg-content" v-html="renderMarkdown(msg.content)"></div>
            </div>
          </div>

          <!-- 流式回复 -->
          <div v-if="store.streaming" class="message-row assistant">
            <div class="msg-avatar"><img src="/mars-avatar.jpg" class="msg-avatar-img" alt="Mars学长" /></div>
            <div class="msg-body">
              <div class="msg-content streaming" v-html="renderMarkdown(store.currentReply)"></div>
              <span class="typing-indicator">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </span>
            </div>
          </div>
        </div>

        <!-- 输入区 -->
        <div class="chat-input-area">
          <div class="input-wrapper">
            <el-input
              v-model="inputText"
              placeholder="输入你的问题..."
              size="large"
              @keydown.enter.exact="sendMessage(inputText)"
              :disabled="store.streaming"
              class="chat-input"
            >
              <template #suffix>
                <el-button
                  type="primary"
                  :icon="Promotion"
                  circle
                  size="small"
                  @click="sendMessage(inputText)"
                  :loading="store.streaming"
                  :disabled="!inputText.trim()"
                />
              </template>
            </el-input>
          </div>
          <div class="input-actions" v-if="store.messages.length > 0">
            <el-button text size="small" @click="store.clearMessages()">
              <el-icon><Delete /></el-icon> 清空对话
            </el-button>
          </div>
          <p class="input-hint">Mars学长基于校园知识库回答，答案仅供参考</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { Promotion, Delete } from '@element-plus/icons-vue'
import { useChatStore } from '@/stores/chat'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const store = useChatStore()
const inputText = ref('')
const messagesContainer = ref(null)

// 每次进入页面展示欢迎页，离开再回来保留对话
onMounted(() => {
  if (!sessionStorage.getItem('qlu-chat-visited')) {
    store.clearMessages()
    sessionStorage.setItem('qlu-chat-visited', '1')
  }
})

// ===== 智谱AI GLM-4-Flash（经 Cloudflare Worker 代理转发）=====
const API_URL = '/zhipu/chat/completions'

// 知识库 System Prompt（从独立文件加载）
import { SYSTEM_PROMPT } from '@/data/systemPrompt.js'

// Markdown rendering
marked.setOptions({
  breaks: true,
  gfm: true
})
const renderMarkdown = (text) => {
  if (!text) return ''
  try {
    const raw = marked.parse(text)
    return DOMPurify.sanitize(raw)
  } catch {
    return text
  }
}

// Scroll to bottom
const scrollToBottom = () => {
  nextTick(() => {
    const el = messagesContainer.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

// 调用智谱AI GLM（经 Cloudflare Worker / Vite / nginx 代理转发，同源无跨域）
const sendMessage = async (text) => {
  const msg = text?.trim()
  if (!msg || store.streaming) return

  inputText.value = ''
  store.addMessage('user', msg)
  store.startStreaming()
  scrollToBottom()

  try {
    // 最近10轮（20条）作为上下文
    const history = store.recentMessages.slice(0, -1).map(m => ({ role: m.role, content: m.content }))

    const requestBody = {
      model: 'glm-4-flash',
      stream: true,
      temperature: 0.3,
      max_tokens: 2048,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history,
        { role: 'user', content: msg }
      ]
    }

    // 1305「访问量过大」限流时最多重试 3 次
    let response
    for (let attempt = 0; ; attempt++) {
      response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      if (response.ok || attempt >= 2) break
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)))
    }

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(errText || 'API请求失败')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data:')) continue
        const data = trimmed.slice(5).trim()
        if (data === '[DONE]') {
          store.finishStreaming()
          scrollToBottom()
          return
        }
        try {
          const json = JSON.parse(data)
          const content = json.choices?.[0]?.delta?.content
          if (content) {
            store.appendToken(content)
            scrollToBottom()
          }
        } catch {}
      }
    }

    store.finishStreaming()
    scrollToBottom()
  } catch (e) {
    console.error('Chat error:', e)
    store.addMessage('assistant', '抱歉，AI服务暂时不可用：' + e.message.slice(0, 80))
    store.finishStreaming()
  }
}
</script>

<style scoped>
.chat-page {
  height: calc(100dvh - 64px);
  height: calc(100vh - 64px);
  background: var(--bg);
}
.chat-layout {
  height: 100%;
  max-width: 900px;
  margin: 0 auto;
}
.chat-main {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Welcome */
.chat-welcome {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}
.welcome-avatar-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}
.chat-welcome h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  background: linear-gradient(135deg, var(--primary-dark), var(--primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.chat-welcome p {
  font-size: 15px;
  color: var(--text-light);
  margin-bottom: 32px;
}
.welcome-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  max-width: 500px;
}
.suggestion-chip {
  padding: 10px 18px;
  border: 1.5px solid var(--border);
  border-radius: 24px;
  background: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text);
}
.suggestion-chip:hover {
  border-color: var(--primary-light);
  color: var(--primary);
  background: rgba(26,111,181,0.04);
  transform: translateY(-1px);
}

/* Messages */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px 20px;
}
.message-row {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}
.message-row.user { flex-direction: row-reverse; }
.msg-avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
.message-row.user .msg-avatar { background: rgba(26,111,181,0.1); }
.message-row.assistant .msg-avatar { background: transparent; }
.msg-avatar-img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}
.msg-body { max-width: 75%; }
.msg-content {
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.7;
  word-break: break-word;
}
.message-row.user .msg-content {
  background: var(--primary);
  color: #fff;
  border-bottom-right-radius: 4px;
}
.message-row.assistant .msg-content {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  border-bottom-left-radius: 4px;
}
.msg-content.streaming { animation: pulse-border 2s infinite; }
@keyframes pulse-border {
  0%, 100% { box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
  50% { box-shadow: 0 2px 12px rgba(26,111,181,0.15); }
}
.typing-indicator {
  display: inline-flex;
  gap: 4px;
  padding: 6px 12px;
  margin-top: 4px;
}
.dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--text-light);
  animation: bounce 1.4s ease-in-out infinite;
}
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes bounce {
  0%, 80%, 100% { opacity: 0.3; transform: translateY(0); }
  40% { opacity: 1; transform: translateY(-6px); }
}

/* Markdown styles inside messages */
.msg-content :deep(h1),
.msg-content :deep(h2),
.msg-content :deep(h3) {
  font-size: 16px;
  font-weight: 600;
  margin: 8px 0 4px;
}
.msg-content :deep(p) { margin: 4px 0; }
.msg-content :deep(ul),
.msg-content :deep(ol) { padding-left: 20px; margin: 4px 0; }
.msg-content :deep(li) { margin: 2px 0; }
.msg-content :deep(code) {
  background: rgba(0,0,0,0.06);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
}
.msg-content :deep(pre) {
  background: #f6f8fa;
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
}
.msg-content :deep(pre code) { background: none; padding: 0; }
.msg-content :deep(strong) { font-weight: 600; }
.msg-content :deep(em) { font-style: italic; }
.msg-content :deep(blockquote) {
  border-left: 3px solid var(--primary-light);
  padding-left: 12px;
  margin: 8px 0;
  color: var(--text-light);
}

/* Input area */
.chat-input-area {
  padding: 16px 20px 20px;
  background: #fff;
  border-top: 1px solid var(--border);
}
.input-wrapper { max-width: 700px; margin: 0 auto; }
.chat-input :deep(.el-input__wrapper) {
  border-radius: 24px;
  padding-right: 8px;
  box-shadow: var(--shadow);
}
.input-actions {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}
.input-hint {
  text-align: center;
  font-size: 12px;
  color: #bbb;
  margin-top: 6px;
}
</style>
