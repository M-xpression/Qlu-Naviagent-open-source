package com.qlu.campus.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 地图热点标注
 */
@Data
@TableName("hotspot")
public class Hotspot {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 建筑/地点名称 */
    private String name;

    /** 分类: teaching/dining/dormitory/library/sports/admin/hospital/service/other */
    private String category;

    /** 简介 */
    private String description;

    /** 详细信息 */
    private String detail;

    /** 图片URL数组(JSON) */
    private String images;

    /** 开放时间 */
    private String openTime;

    /** 热点X坐标(图片百分比%) */
    private Double xPercent;

    /** 热点Y坐标(图片百分比%) */
    private Double yPercent;

    /** 所属地图图片URL */
    private String mapImage;

    /** 排序 */
    private Integer sortOrder;

    /** 是否发布 */
    private Boolean isPublished;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
