package com.qlu.campus.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.qlu.campus.common.Result;
import com.qlu.campus.entity.Article;
import com.qlu.campus.service.CampusService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 校园信息接口（公开）
 */
@RestController
@RequestMapping("/api/campus")
@RequiredArgsConstructor
public class CampusController {

    private final CampusService campusService;

    /** 获取文章列表（按分类） */
    @GetMapping("/articles")
    public Result<List<Article>> listByCategory(@RequestParam(required = false) String category) {
        return Result.ok(campusService.listByCategory(category));
    }

    /** 分页获取文章 */
    @GetMapping("/articles/page")
    public Result<Page<Article>> page(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String category) {
        return Result.ok(campusService.page(current, size, category));
    }

    /** 根据slug获取文章详情 */
    @GetMapping("/articles/{slug}")
    public Result<Article> getBySlug(@PathVariable String slug) {
        Article article = campusService.getBySlug(slug);
        return article != null ? Result.ok(article) : Result.notFound("文章不存在");
    }

    /** 根据ID获取文章 */
    @GetMapping("/articles/detail/{id}")
    public Result<Article> getById(@PathVariable Long id) {
        Article article = campusService.getById(id);
        return article != null ? Result.ok(article) : Result.notFound("文章不存在");
    }
}
