<template>
  <div class="home-page">
    <!-- Hero 区域 -->
    <section class="hero">
      <div class="hero-bg">
        <div class="hero-orb orb-1"></div>
        <div class="hero-orb orb-2"></div>
      </div>
      <div class="hero-content">
        <img src="/emblem.png" class="hero-emblem" alt="校徽" />
        <span class="hero-badge">🎉 2026 新生指南</span>
        <h1 class="hero-title">齐鲁工业大学(山东省科学院)</h1>
        <p class="hero-subtitle">明德励志 崇实尚能</p>
        <p class="hero-desc">史上最强新生攻略，这里有你需要了解的一切</p>
        <div class="hero-actions">
          <el-button type="primary" size="large" round @click="$router.push('/map')">
            <el-icon><MapLocation /></el-icon> 查看校园地图
          </el-button>
          <el-button size="large" round class="btn-outline" @click="$router.push('/chat')">
            <el-icon><ChatDotRound /></el-icon> 问问Mars学长
          </el-button>
        </div>
        <div class="scroll-hint" @click="scrollDown">
          <span class="scroll-text">下滑查看更多</span>
          <span class="scroll-arrow">↓</span>
        </div>
      </div>
    </section>

    <!-- 可下滑查看更多内容 -->
    <div class="desktop-sections">
      <!-- 校园设施 -->
      <section class="section section-alt">
        <div class="section-header">
          <h2 class="section-title">🏗️ 校园设施</h2>
        </div>
        <div class="facility-grid">
          <div class="facility-card" v-for="f in facilities" :key="f.name">
            <div class="facility-icon">{{ f.icon }}</div>
            <h3>{{ f.name }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </section>

      <!-- 生活指南 -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">📋 新生必读</h2>
        </div>
        <div class="guide-grid">
          <div class="guide-card" v-for="g in guides" :key="g.title" @click="expandGuide(g)">
            <div class="guide-header">
              <span class="guide-icon">{{ g.icon }}</span>
              <h3>{{ g.title }}</h3>
              <el-icon class="guide-arrow"><ArrowRight /></el-icon>
            </div>
            <transition name="expand">
              <p v-if="g.expanded" class="guide-content">{{ g.content }}</p>
            </transition>
          </div>
        </div>
      </section>

      <!-- 新生必备物资 -->
      <section class="section section-alt">
        <div class="section-header">
          <h2 class="section-title">🎒 新生必备物资清单</h2>
          <p class="section-desc">开学前照着准备，不慌不忙~</p>
        </div>
        <div class="checklist-grid">
          <div class="check-card" v-for="item in checklist" :key="item.title">
            <div class="check-icon">{{ item.icon }}</div>
            <div class="check-body">
              <h4>{{ item.title }}</h4>
              <ul>
                <li v-for="d in item.items" :key="d">{{ d }}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- 快速导航 -->
      <section class="section section-alt">
        <div class="section-header">
          <h2 class="section-title">🧭 快速导航</h2>
        </div>
        <div class="quick-links">
          <router-link to="/map" class="quick-link-card map-link">
            <span class="ql-icon">🗺️</span>
            <span class="ql-text">
              <strong>校园地图</strong>
              <small>查看教学楼、食堂、宿舍位置</small>
            </span>
          </router-link>
          <router-link to="/chat" class="quick-link-card chat-link">
            <span class="ql-icon">🤖</span>
            <span class="ql-text">
              <strong>Mars学长</strong>
              <small>有任何校园问题，问Mars学长</small>
            </span>
          </router-link>
        </div>
      </section>

      <!-- 联系作者 -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">💬 联系作者</h2>
          <p class="section-desc">有任何问题或建议，欢迎添加学长微信</p>
        </div>
        <div class="contact-card">
          <img src="/wechat-qr.jpg" alt="微信二维码" class="qr-img" />
          <div class="contact-info">
            <span class="contact-tag">📱 扫码添加微信</span>
            <span class="contact-hint">备注"新生"更快通过哦~</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const facilities = [
  { icon: '🍜', name: '三大食堂', desc: '一餐精致、二餐实惠、三餐多样，还有蜜雪冰城、瑞幸、库迪咖啡' },
  { icon: '📖', name: '图书馆', desc: '全校第二宏伟建筑，早6点至晚10点开放，空调覆盖，期末复习圣地' },
  { icon: '🏫', name: '教学楼', desc: '1/2/3号教学楼，分平阶教室和阶梯教室，另有文科楼和机电楼' },
  { icon: '📦', name: '菜鸟驿站', desc: '全长清最大快递站，京东顺丰覆盖，理发店超市一应俱全' },
  { icon: '🛒', name: '商业街', desc: '东门直达，饭店小吃电影院，青春夜市每晚营业' },
  { icon: '🏟️', name: '运动场地', desc: '操场、体育馆、篮球场，各类体育设施齐全' }
]

const guides = ref([
  { icon: '🏠', title: '宿舍条件', expanded: false,
    content: '6人间，上床下桌或三连桌。独立空调+暖气+阳台+卫生间（不能洗澡）。夏季12点断电，冬季11点断电。每层有公共洗衣机、吹风机、饮水机。目前正在翻新升级。' },
  { icon: '🪖', title: '军训安排', expanded: false,
    content: '开学典礼后开始，时长约2周，强度适中。军训期间不能挂床帘，结束后随意。这是认识同学、表现自己的好机会。' },
  { icon: '📚', title: '晚自习与学习', expanded: false,
    content: '部分学部大一有晚自习（周天至周四），会收手机。大一不能考四六级，建议保持英语水平，大二再考。' },
  { icon: '🎯', title: '转专业', expanded: false,
    content: '整体难度不高，但会限制高中选课，部分专业限制高数成绩。具体可咨询学长学姐。' },
  { icon: '🎪', title: '社团与组织', expanded: false,
    content: '院学生会、校学生会、青协、广播站等。十月"百团大战"社团招新，吉他社、微博协会等兴趣社团丰富。' },
  { icon: '🎉', title: '校园活动', expanded: false,
    content: '夜跑比赛、校园歌手大赛、王者荣耀高校赛等。操场经常有放电影、调酒、唱歌等小型活动。' },
  { icon: '🚌', title: '周边交通', expanded: false,
    content: '北门地铁站紫薇路直通济南西站。校门口学生公交可达历下区恒隆、万达。南边有园博园。大明湖、泉城广场、宽厚里、芙蓉街地铁可达。' },
  { icon: '📦', title: '快递地址', expanded: false,
    content: '山东省济南市长清区崮云湖街道大学路3501号 齐鲁工业大学(山东省科学院)长清校区。菜鸟驿站是全长清最大的快递站，含邮政（家属院天猫超市）、京东、顺丰、菜鸟。' },
  { icon: '⚠️', title: '防骗提示', expanded: false,
    content: '任何非官方人员以任何形式联系你进行消费或办理手续都是骗人的！校园卡不强制办理，录取通知书里的卡不建议太早激活。' }
])

const checklist = [
  { icon: '🪪', title: '证件类', items: ['身份证', '准考证', '录取通知书', '个人档案', '红白蓝底1寸2寸照片', '助学贷款回执（如申请）'] },
  { icon: '📱', title: '电子产品', items: ['手机 + 充电宝', '电脑 + 充电线', '耳机（建议自备）'] },
  { icon: '🛏️', title: '床上用品', items: ['床垫（建议自备好用的）', '枕头、被子、褥子', '床帘（军训后可用）'] },
  { icon: '🧴', title: '日常用品', items: ['洗漱用品（牙刷、毛巾等）', '换洗衣物', '基础药品（感冒药、创可贴）'] },
  { icon: '📝', title: '学习 & 军训', items: ['水杯（军训必备！）', '纸笔（不用太多）', '准备一段自我介绍'] },
  { icon: '💳', title: '财务准备', items: ['开通通知书里的银行卡', '带少量现金备用'] },
]

const expandGuide = (g) => { g.expanded = !g.expanded }
const scrollDown = () => {
  document.querySelector('.desktop-sections')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
/* ===== Hero ===== */
.hero {
  position: relative;
  overflow: hidden;
  padding: 80px 24px 64px;
  text-align: center;
  background: linear-gradient(135deg, #e8f4fd 0%, #f0e6f6 40%, #fef5e7 100%);
  min-height: auto;
}
.hero-bg { position: absolute; inset: 0; overflow: hidden; }
.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  animation: float 12s ease-in-out infinite;
}
.orb-1 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, var(--primary-light), transparent);
  top: -100px; right: -100px;
}
.orb-2 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, var(--accent), transparent);
  bottom: -80px; left: -80px;
  animation-delay: -6s;
}
@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}
.hero-content { position: relative; z-index: 1; max-width: 700px; margin: 0 auto; }
.hero-emblem { width: 150px; height: 150px; object-fit: contain; margin: 0 auto 20px; display: block; }
.hero-badge {
  display: inline-block;
  padding: 6px 18px;
  border-radius: 20px;
  background: rgba(26, 111, 181, 0.1);
  color: var(--primary);
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 20px;
}
.hero-title {
  font-size: 48px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary-dark), var(--primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}
.hero-subtitle {
  font-size: 18px;
  color: var(--text-light);
  margin-bottom: 8px;
}
.hero-desc {
  font-size: 15px;
  color: #999;
  margin-bottom: 32px;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
}
.hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.scroll-hint {
  margin-top: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  animation: bounce-down 2s ease-in-out infinite;
}
.scroll-text { font-size: 13px; color: var(--text-light); }
.scroll-arrow { font-size: 24px; color: var(--primary);
  animation: arrow-bounce 0.8s ease-in-out infinite alternate; }
@keyframes arrow-bounce { 0% { transform: translateY(0); } 100% { transform: translateY(8px); } }
@keyframes bounce-down {
  0%, 100% { opacity: 0.5; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(6px); }
}
.btn-outline {
  background: rgba(255,255,255,0.7) !important;
  border: 2px solid var(--border) !important;
}
.btn-outline:hover {
  border-color: var(--primary) !important;
  color: var(--primary) !important;
}

/* ===== Sections ===== */
.section { padding: 64px 24px; max-width: 1100px; margin: 0 auto; }
.section-alt { background: #fff; max-width: 100%; }
.section-header { text-align: center; margin-bottom: 40px; }
.section-title { font-size: 28px; font-weight: 700; color: var(--text); }
.section-desc { font-size: 15px; color: var(--text-light); margin-top: 8px; }

/* ===== Facilities ===== */
.facility-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
}
.facility-card {
  background: #fff;
  padding: 28px 20px;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  text-align: center;
  transition: all 0.3s ease;
}
.facility-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
.facility-icon { font-size: 36px; margin-bottom: 12px; }
.facility-card h3 { font-size: 16px; font-weight: 600; margin-bottom: 6px; }
.facility-card p { font-size: 13px; color: var(--text-light); line-height: 1.6; }

/* ===== Guide ===== */
.guide-grid { display: flex; flex-direction: column; gap: 10px; }
.guide-card {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: 0 1px 6px rgba(0,0,0,0.04);
  border: 1px solid var(--border);
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.guide-card:hover { border-color: var(--primary-light); box-shadow: var(--shadow); }
.guide-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.guide-icon { font-size: 22px; }
.guide-header h3 { font-size: 16px; font-weight: 600; flex: 1; }
.guide-arrow { color: var(--text-light); transition: transform 0.3s ease; }
.guide-content {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  font-size: 14px;
  color: var(--text-light);
  line-height: 1.7;
}
.expand-enter-active, .expand-leave-active {
  transition: all 0.3s ease;
}
.expand-enter-from, .expand-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
  padding-top: 0;
}

/* ===== Quick Links ===== */
.quick-links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}
.quick-link-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 28px 24px;
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  text-decoration: none;
  color: var(--text);
  border: 2px solid transparent;
  transition: all 0.3s ease;
}
.map-link:hover { border-color: var(--primary); transform: translateY(-2px); }
.chat-link:hover { border-color: var(--accent); transform: translateY(-2px); }
.ql-icon { font-size: 40px; }
.ql-text { display: flex; flex-direction: column; gap: 4px; }
.ql-text strong { font-size: 18px; }
.ql-text small { font-size: 13px; color: var(--text-light); }

/* ===== Checklist ===== */
.checklist-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
}
.check-card {
  background: #fff;
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow);
  border-left: 4px solid var(--primary);
  transition: transform 0.2s;
}
.check-card:hover { transform: translateY(-2px); }
.check-icon { font-size: 28px; margin-bottom: 8px; }
.check-body h4 { font-size: 15px; font-weight: 600; margin-bottom: 8px; color: var(--text); }
.check-body ul { list-style: none; padding: 0; margin: 0; }
.check-body li {
  font-size: 13px;
  color: var(--text-light);
  padding: 3px 0;
  padding-left: 16px;
  position: relative;
}
.check-body li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--primary);
  font-size: 11px;
  font-weight: 700;
}

/* ===== Contact ===== */
.contact-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: 300px;
  margin: 0 auto;
  padding: 28px;
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
.qr-img {
  width: 200px;
  height: 200px;
  border-radius: 12px;
  object-fit: cover;
  border: 2px solid var(--border);
}
.contact-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.contact-tag {
  font-size: 15px;
  font-weight: 600;
  color: var(--primary);
}
.contact-hint {
  font-size: 13px;
  color: var(--text-light);
}

@media (max-width: 768px) {
  .hero {
    min-height: 100dvh;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
  }
  .hero-emblem { width: 130px; height: 130px; }
  .hero-title { font-size: 34px; }
  .hero-subtitle { font-size: 16px; }
  .hero-desc { font-size: 14px; }
  .hero-badge { font-size: 13px; }
  .hero-actions { flex-direction: column; align-items: center; }
  .hero-actions .el-button { width: 220px; }
  .hero-content { max-width: 100%; }
  .facility-grid { grid-template-columns: 1fr; }
  .quick-links { grid-template-columns: 1fr; }
  .checklist-grid { grid-template-columns: repeat(2, 1fr); padding: 0 16px; }
}
@media (max-width: 360px) {
  .hero-title { font-size: 28px; }
  .hero-emblem { width: 70px; height: 70px; }
  .checklist-grid { grid-template-columns: 1fr; }
}
</style>
