package com.qlu.campus.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.qlu.campus.entity.Hotspot;
import com.qlu.campus.mapper.HotspotMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 地图热点服务
 */
@Service
@RequiredArgsConstructor
public class HotspotService {

    private final HotspotMapper hotspotMapper;

    /**
     * 获取所有已发布热点
     */
    public List<Hotspot> listAll() {
        return hotspotMapper.selectList(
                new LambdaQueryWrapper<Hotspot>()
                        .eq(Hotspot::getIsPublished, true)
                        .orderByAsc(Hotspot::getSortOrder)
        );
    }

    /**
     * 按分类获取热点
     */
    public List<Hotspot> listByCategory(String category) {
        LambdaQueryWrapper<Hotspot> wrapper = new LambdaQueryWrapper<Hotspot>()
                .eq(Hotspot::getIsPublished, true)
                .orderByAsc(Hotspot::getSortOrder);
        if (category != null && !category.isEmpty()) {
            wrapper.eq(Hotspot::getCategory, category);
        }
        return hotspotMapper.selectList(wrapper);
    }

    /**
     * 获取所有热点（含未发布，管理后台用）
     */
    public List<Hotspot> listAllForAdmin() {
        return hotspotMapper.selectList(
                new LambdaQueryWrapper<Hotspot>()
                        .orderByAsc(Hotspot::getSortOrder)
        );
    }

    /**
     * 根据ID获取
     */
    public Hotspot getById(Long id) {
        return hotspotMapper.selectById(id);
    }

    /**
     * 创建热点
     */
    public void create(Hotspot hotspot) {
        hotspotMapper.insert(hotspot);
    }

    /**
     * 更新热点
     */
    public void update(Hotspot hotspot) {
        hotspotMapper.updateById(hotspot);
    }

    /**
     * 删除热点
     */
    public void delete(Long id) {
        hotspotMapper.deleteById(id);
    }
}
