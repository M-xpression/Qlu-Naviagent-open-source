-- ============================================
-- 齐鲁工业大学校园智能导览平台 - 数据库初始化
-- ============================================

CREATE DATABASE IF NOT EXISTS qlu_campus
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE qlu_campus;

-- ===================== 校园文章 =====================
CREATE TABLE IF NOT EXISTS article (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    title       VARCHAR(100) NOT NULL COMMENT '标题',
    slug        VARCHAR(100) UNIQUE COMMENT 'URL标识',
    content     TEXT NOT NULL COMMENT '正文(Markdown)',
    category    VARCHAR(30) COMMENT '分类: overview/department/culture/scenery',
    cover_image VARCHAR(500) COMMENT '封面图URL',
    sort_order  INT DEFAULT 0 COMMENT '排序',
    is_published TINYINT DEFAULT 1 COMMENT '是否发布',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='校园文章';

-- ===================== 地图热点 =====================
CREATE TABLE IF NOT EXISTS hotspot (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(50) NOT NULL COMMENT '建筑/地点名称',
    category    VARCHAR(20) NOT NULL COMMENT '分类: teaching/dining/dormitory/library/sports/admin/hospital/service/other',
    description TEXT COMMENT '简介',
    detail      TEXT COMMENT '详细信息',
    images      JSON COMMENT '图片URL数组',
    open_time   VARCHAR(100) COMMENT '开放时间',
    x_percent   DECIMAL(6,3) NOT NULL COMMENT '热点X坐标(图片百分比)',
    y_percent   DECIMAL(6,3) NOT NULL COMMENT '热点Y坐标(图片百分比)',
    map_image   VARCHAR(500) COMMENT '所属地图图片URL',
    sort_order  INT DEFAULT 0,
    is_published TINYINT DEFAULT 1,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_published (is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='地图热点标注';

-- ===================== 知识库 =====================
CREATE TABLE IF NOT EXISTS knowledge (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    title       VARCHAR(200) NOT NULL COMMENT '知识标题',
    content     TEXT NOT NULL COMMENT '知识内容',
    category    VARCHAR(30) COMMENT '分类',
    source      VARCHAR(200) COMMENT '来源',
    keywords    VARCHAR(500) COMMENT '关键词(逗号分隔)',
    is_active   TINYINT DEFAULT 1,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FULLTEXT INDEX ft_content (title, content, keywords) WITH PARSER ngram
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识库';

-- ===================== AI对话 =====================
CREATE TABLE IF NOT EXISTS chat_message (
    id           BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_id   VARCHAR(64) NOT NULL COMMENT '会话ID',
    role         VARCHAR(10) NOT NULL COMMENT 'user/assistant',
    content      TEXT NOT NULL COMMENT '消息内容',
    sources      JSON COMMENT '引用来源',
    feedback     VARCHAR(4) COMMENT 'up/down',
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='对话消息';

-- ===================== 管理员 =====================
CREATE TABLE IF NOT EXISTS admin_user (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    username    VARCHAR(50) UNIQUE NOT NULL,
    password    VARCHAR(200) NOT NULL COMMENT 'BCrypt加密',
    role        VARCHAR(20) DEFAULT 'editor' COMMENT 'admin/editor/viewer',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员用户';

-- ===================== 文件上传记录 =====================
CREATE TABLE IF NOT EXISTS upload_file (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    file_name   VARCHAR(200) COMMENT '原始文件名',
    file_path   VARCHAR(500) NOT NULL COMMENT '存储路径',
    file_url    VARCHAR(500) NOT NULL COMMENT '访问URL',
    file_size   BIGINT COMMENT '字节',
    file_type   VARCHAR(50) COMMENT 'MIME类型',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='上传文件记录';

-- ===================== 初始数据 =====================
-- 默认管理员 (密码: admin123, BCrypt加密)
INSERT INTO admin_user (username, password, role) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'admin');
