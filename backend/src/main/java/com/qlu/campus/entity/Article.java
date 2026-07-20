package com.qlu.campus.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 校园文章（学校概况/院系介绍/校园文化等）
 */
@Data
@TableName("article")
public class Article {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 标题 */
    private String title;

    /** URL标识 */
    private String slug;

    /** 正文(Markdown) */
    private String content;

    /** 分类: overview/department/culture/scenery */
    private String category;

    /** 封面图URL */
    private String coverImage;

    /** 排序 */
    private Integer sortOrder;

    /** 是否发布 */
    private Boolean isPublished;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
