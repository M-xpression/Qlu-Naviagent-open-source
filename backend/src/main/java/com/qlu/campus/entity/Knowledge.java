package com.qlu.campus.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 知识库条目
 */
@Data
@TableName("knowledge")
public class Knowledge {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 知识标题 */
    private String title;

    /** 知识内容 */
    private String content;

    /** 分类 */
    private String category;

    /** 来源 */
    private String source;

    /** 关键词(逗号分隔) */
    private String keywords;

    /** 是否启用 */
    private Boolean isActive;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
