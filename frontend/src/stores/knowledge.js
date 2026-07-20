import { defineStore } from 'pinia'

const STORAGE_KEY = 'qlu-campus-knowledge'

const defaultItems = [
  { id: 1, title: '学校概况', category: '学校信息', keywords: '齐鲁工业大学,齐鲁工大,校训,校区,面积', content: '齐鲁工业大学（山东省科学院）简称齐鲁工大，长清校区位于济南市长清区大学路3501号，占地2070亩，在校生约30000人。四个校门：南门为主校门，东门商业街，北门地铁紫薇路站，西门为山东中医药大学。校训：明德励志 崇实尚能。实行科教融合办学模式，与山东省科学院整合发展。', source: '官方', isActive: true },
  { id: 2, title: '院系与专业', category: '学习', keywords: '学院,学部,专业,王牌,计算机,轻工', content: '20+学部/学院。王牌专业：计算机科学（软科全国25位）、轻工技术（全国第4位）、网络空间安全。2025新增：人工智能拔尖创新班、储能科学、集成电路。2026新增：智能交互设计、智能科学拔尖创新班。69个本科专业中37个国家级/省级一流。', source: '官方', isActive: true },
  { id: 3, title: '学科实力', category: '学习', keywords: '博士点,科研,经费,ESI,排名,实验室', content: '5个博士点+1博士专业学位。2024年新增5个博士点省属高校首位。13个学科上榜软科。年度科研经费突破10亿元连续四年。2个全国重点实验室。8个学科进入ESI全球前1%。2024年省属高校绩效考核I类第1名。', source: '官方', isActive: true },
  { id: 4, title: '奖学金', category: '学习', keywords: '奖学金,国奖,励志,校长奖,钱', content: '国家奖学金8000元/年。国家励志奖学金5000元/年。省政府奖学金6000元/年。校长奖学金10000元/年（每年20人）。学习成绩优秀奖学金一等2000元/年（4%），二等600元/年（20%）。班级奖学金600元/班/学期。', source: '官方', isActive: true },
  { id: 5, title: '助学金与贷款', category: '生活服务', keywords: '助学金,贷款,贫困,勤工助学,困难补助', content: '国家助学金平均3300元/年分三档（2200-4400元），覆盖约11.8%在校生。国家助学贷款最高8000元/年。困难补助不超过2000元/人/学年。勤工助学360-480元/月。', source: '官方', isActive: true },
  { id: 6, title: '学费标准', category: '生活服务', keywords: '学费,住宿费,收费,多少钱', content: '普通本科（学分制）4400-6600元/年，含专业注册学费+学分学费（100元/学分）。计算机/AI工科5500-6600元/年。法学/日语文科4400元/年。中外合作45000-52000元/年。住宿费6人间1000-1100元/年，4人间1300元/年。', source: '官方', isActive: true },
  { id: 7, title: '考研与就业', category: '学习', keywords: '考研,就业,工作,录取率', content: '全校平均考研率约30%，优势专业超50%，部分实验班达67.6%。本科初次就业率约79%-90%，硕士约93%。主要就业城市济南、青岛为主，辐射北京、上海。工科省内认可度高。', source: '官方', isActive: true },
  { id: 8, title: '食堂介绍', category: '生活服务', keywords: '食堂,餐饮,吃饭,美食,餐厅', content: '三个食堂2022年全面升级。第一食堂两层东门C位智慧餐厅15-30元。第二食堂三层人气TOP1支持支付宝12-20元。第三食堂三层校园中央各地风味12-20元。早餐7:00-8:30，午餐11:00-12:30，晚餐17:00-18:30。二餐西侧711便利店24h。校内饮品：蜜雪冰城、库迪、瑞幸、沪上阿姨。', source: '新生攻略', isActive: true },
  { id: 9, title: '教学楼', category: '学习', keywords: '教学楼,教室,自习,上课', content: '1/2/3号教学楼，平阶教室（6层）和阶梯教室（4层容纳200人）。标注如"1教jt101"=一号教学楼阶梯101。文科楼和三座机电楼也上课。可在教务系统找空教室自习。', source: '新生攻略', isActive: true },
  { id: 10, title: '图书馆', category: '学习', keywords: '图书馆,自习,借书,开放时间', content: '全校标志性建筑。7:00-21:00开放（除寒暑假外全年）。空调覆盖，藏书293万+册，电子图书152.9万册。二楼至六楼均设自习室，学习氛围浓厚。', source: '官方', isActive: true },
  { id: 11, title: '宿舍条件', category: '生活服务', keywords: '宿舍,住宿,空调,水电,寝室', content: '6人间为主（也有4/8人间），上床下桌或三连桌。2025年暑假投资1.3亿元改造：储物空间增大、床铺自带床帘、阳台封窗晾衣、每层两间改造为浴室、将更换指纹锁。独立空调+暖气+阳台+部分独立卫生间。夏季12点断电（部分楼栋不断电），冬季11点断电，门禁23:00。每层公共浴室热水房（一卡通）、洗衣机、吹风机、饮水机（校园汇生活APP）。面部识别门禁。禁用违规电器，每周检查。', source: '新生攻略', isActive: true },
  { id: 12, title: '体育设施', category: '运动', keywords: '操场,运动,篮球,足球,网球,体育馆', content: '两个操场。第二操场36500㎡（新修）：400米跑道、8片篮球场、8片排球场、6片网球场。艺体中心有乒乓球和羽毛球。第一操场也有各类球类场地。', source: '官方', isActive: true },
  { id: 13, title: '校园交通', category: '生活服务', keywords: '公交,共享单车,校内车,哈啰', content: '哈啰共享单车/电动车。校园公交车0.4元/次（微信扫码），7:30-20:00环线双向对开。', source: '官方', isActive: true },
  { id: 14, title: '校医院', category: '生活服务', keywords: '医院,看病,医务室,急诊,心理', content: '东侧一餐厅与艺体中心之间。就诊带身份证/一卡通。电话：0531-89631120。另设大学生心理健康教育中心。', source: '官方', isActive: true },
  { id: 15, title: '军训安排', category: '学习', keywords: '军训,开学,新生,训练', content: '开学典礼后开始，时长约2周，强度适中。军训期间不能挂床帘，结束后随意。是认识同学、表现自己的好机会。', source: '新生攻略', isActive: true },
  { id: 16, title: '快递信息', category: '生活服务', keywords: '快递,菜鸟,邮政,京东,顺丰', content: '二餐前菜鸟驿站（中通/申通/韵达）、25号楼对面（圆通/顺丰）、二餐后面（邮政/EMS）。快递地址：山东省济南市长清区崮云湖街道大学路3501号齐鲁工业大学(山东省科学院)长清校区。', source: '新生攻略', isActive: true },
  { id: 17, title: '交通出行', category: '生活服务', keywords: '地铁,公交,济南西站,出行,火车站', content: '地铁1号线：南门近大学城站，北门近紫薇路站，直达济南西站，换乘2号线进市区。公交K24/K141/K25/K301可达市区、西站、园博园。东门直通大学城商业街，南边有银座商城和园博园（水上乐园）。大明湖、泉城广场、宽厚里、芙蓉街地铁可达。', source: '新生攻略', isActive: true },
  { id: 18, title: '晚自习与学习', category: '学习', keywords: '晚自习,学习,大一,四级,六级,转专业', content: '部分学部大一有晚自习（周天至周四）会收手机。大一不能考四六级，大二再考。转专业整体难度不高，限制高中选课和部分高数成绩。', source: '新生攻略', isActive: true },
  { id: 19, title: '社团与活动', category: '校园生活', keywords: '社团,活动,学生会,百团大战,比赛', content: '院/校学生会、青协、食工会、广播站等组织。十月"百团大战"社团招新，吉他社、微博协会等。校园活动：夜跑比赛、校园歌手大赛、王者荣耀高校赛，操场常有放电影/调酒/唱歌。', source: '新生攻略', isActive: true },
  { id: 20, title: '防骗与校园卡', category: '生活服务', keywords: '防骗,校园卡,电话卡,骗人,安全', content: '学校不强制办理校园卡，流量够用完全没必要。录取通知书里的卡不建议太早激活，开学后货比三家。任何非官方人员联系消费或办理手续都是骗人的！部分专业大二搬去彩石校区。', source: '新生攻略', isActive: true },
]

function loadFromStorage() {
  try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) { const d = JSON.parse(raw); if (Array.isArray(d) && d.length > 0) return d } } catch {}
  return null
}
function saveToStorage(items) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {} }

export const useKnowledgeStore = defineStore('knowledge', () => {
  const saved = loadFromStorage()
  const items = ref(saved || [...defaultItems])
  const nextId = ref(Math.max(...items.value.map(i => i.id), defaultItems.length) + 1)

  const allItems = computed(() => items.value)

  const add = (data) => { items.value.push({ ...data, id: nextId.value++ }); saveToStorage(items.value) }
  const update = (data) => { const idx = items.value.findIndex(i => i.id === data.id); if (idx !== -1) { items.value[idx] = { ...items.value[idx], ...data }; saveToStorage(items.value) } }
  const remove = (id) => { const idx = items.value.findIndex(i => i.id === id); if (idx !== -1) { items.value.splice(idx, 1); saveToStorage(items.value) } }

  return { items, allItems, add, update, remove }
})
