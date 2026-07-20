package com.qlu.campus.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.qlu.campus.entity.Article;
import com.qlu.campus.mapper.ArticleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 校园信息服务
 */
@Service
@RequiredArgsConstructor
public class CampusService {

    private final ArticleMapper articleMapper;

    /**
     * 按分类获取文章列表
     */
    public List<Article> listByCategory(String category) {
        return articleMapper.selectList(
                new LambdaQueryWrapper<Article>()
                        .eq(Article::getCategory, category)
                        .eq(Article::getIsPublished, true)
                        .orderByAsc(Article::getSortOrder)
        );
    }

    /**
     * 分页获取文章
     */
    public Page<Article> page(int current, int size, String category) {
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<Article>()
                .eq(Article::getIsPublished, true)
                .orderByAsc(Article::getSortOrder);
        if (category != null && !category.isEmpty()) {
            wrapper.eq(Article::getCategory, category);
        }
        return articleMapper.selectPage(new Page<>(current, size), wrapper);
    }

    /**
     * 根据slug获取文章详情
     */
    public Article getBySlug(String slug) {
        return articleMapper.selectOne(
                new LambdaQueryWrapper<Article>()
                        .eq(Article::getSlug, slug)
                        .eq(Article::getIsPublished, true)
        );
    }

    /**
     * 根据ID获取文章
     */
    public Article getById(Long id) {
        return articleMapper.selectById(id);
    }

    /**
     * 创建文章
     */
    public void create(Article article) {
        articleMapper.insert(article);
    }

    /**
     * 更新文章
     */
    public void update(Article article) {
        articleMapper.updateById(article);
    }

    /**
     * 删除文章
     */
    public void delete(Long id) {
        articleMapper.deleteById(id);
    }
}
