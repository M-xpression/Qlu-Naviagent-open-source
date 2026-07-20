package com.qlu.campus.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 对话消息
 */
@Data
@TableName("chat_message")
public class ChatMessage {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 会话ID */
    private String sessionId;

    /** 角色: user/assistant */
    private String role;

    /** 消息内容 */
    private String content;

    /** 引用来源(JSON) */
    private String sources;

    /** 反馈: up/down */
    private String feedback;

    private LocalDateTime createdAt;
}
