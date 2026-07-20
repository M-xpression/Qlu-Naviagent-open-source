package com.qlu.campus.controller;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.crypto.digest.BCrypt;
import com.qlu.campus.common.Result;
import com.qlu.campus.entity.*;
import com.qlu.campus.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 管理后台接口
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final CampusService campusService;
    private final HotspotService hotspotService;
    private final KnowledgeService knowledgeService;
    private final com.qlu.campus.mapper.AdminUserMapper adminUserMapper;

    // ===== 认证 =====

    @PostMapping("/login")
    public Result<Map<String, String>> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        AdminUser user = adminUserMapper.selectOne(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<AdminUser>()
                        .eq(AdminUser::getUsername, username)
        );

        if (user == null || !BCrypt.checkpw(password, user.getPassword())) {
            return Result.fail(401, "用户名或密码错误");
        }

        StpUtil.login(user.getId());
        Map<String, String> result = new HashMap<>();
        result.put("token", StpUtil.getTokenValue());
        result.put("role", user.getRole());
        return Result.ok(result);
    }

    @PostMapping("/logout")
    public Result<?> logout() {
        StpUtil.logout();
        return Result.ok();
    }

    // ===== 文章管理 =====

    @PostMapping("/articles")
    public Result<?> createArticle(@RequestBody Article article) {
        campusService.create(article);
        return Result.ok();
    }

    @PutMapping("/articles/{id}")
    public Result<?> updateArticle(@PathVariable Long id, @RequestBody Article article) {
        article.setId(id);
        campusService.update(article);
        return Result.ok();
    }

    @DeleteMapping("/articles/{id}")
    public Result<?> deleteArticle(@PathVariable Long id) {
        campusService.delete(id);
        return Result.ok();
    }

    // ===== 热点管理 =====

    @GetMapping("/hotspots")
    public Result<List<Hotspot>> listHotspots() {
        return Result.ok(hotspotService.listAllForAdmin());
    }

    @PostMapping("/hotspots")
    public Result<?> createHotspot(@RequestBody Hotspot hotspot) {
        hotspotService.create(hotspot);
        return Result.ok();
    }

    @PutMapping("/hotspots/{id}")
    public Result<?> updateHotspot(@PathVariable Long id, @RequestBody Hotspot hotspot) {
        hotspot.setId(id);
        hotspotService.update(hotspot);
        return Result.ok();
    }

    @DeleteMapping("/hotspots/{id}")
    public Result<?> deleteHotspot(@PathVariable Long id) {
        hotspotService.delete(id);
        return Result.ok();
    }

    // ===== 知识库管理 =====

    @GetMapping("/knowledge")
    public Result<List<Knowledge>> listKnowledge() {
        return Result.ok(knowledgeService.listAllForAdmin());
    }

    @PostMapping("/knowledge")
    public Result<?> createKnowledge(@RequestBody Knowledge knowledge) {
        knowledgeService.create(knowledge);
        return Result.ok();
    }

    @PutMapping("/knowledge/{id}")
    public Result<?> updateKnowledge(@PathVariable Long id, @RequestBody Knowledge knowledge) {
        knowledge.setId(id);
        knowledgeService.update(knowledge);
        return Result.ok();
    }

    @DeleteMapping("/knowledge/{id}")
    public Result<?> deleteKnowledge(@PathVariable Long id) {
        knowledgeService.delete(id);
        return Result.ok();
    }
}
