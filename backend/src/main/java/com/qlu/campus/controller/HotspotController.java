package com.qlu.campus.controller;

import com.qlu.campus.common.Result;
import com.qlu.campus.entity.Hotspot;
import com.qlu.campus.service.HotspotService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 地图热点接口
 */
@RestController
@RequiredArgsConstructor
public class HotspotController {

    private final HotspotService hotspotService;

    /** 公开 - 按分类获取热点 */
    @GetMapping("/api/hotspots")
    public Result<List<Hotspot>> list(@RequestParam(required = false) String category) {
        if (category != null && !category.isEmpty()) {
            return Result.ok(hotspotService.listByCategory(category));
        }
        return Result.ok(hotspotService.listAll());
    }

    /** 公开 - 获取单个热点 */
    @GetMapping("/api/hotspots/{id}")
    public Result<Hotspot> getById(@PathVariable Long id) {
        Hotspot h = hotspotService.getById(id);
        return h != null ? Result.ok(h) : Result.notFound("热点不存在");
    }
}
