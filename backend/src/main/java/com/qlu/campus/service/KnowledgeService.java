package com.qlu.campus.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.qlu.campus.entity.Knowledge;
import com.qlu.campus.mapper.KnowledgeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 知识库服务
 */
@Service
@RequiredArgsConstructor
public class KnowledgeService {

    private final KnowledgeMapper knowledgeMapper;

    /**
     * MySQL全文检索知识库
     */
    public List<Knowledge> search(String query, int limit) {
        return knowledgeMapper.fullTextSearch(query, limit);
    }

    /**
     * 关键词模糊搜索（兜底：全文索引无结果时使用）
     */
    public List<Knowledge> searchByLike(String keyword, int limit) {
        return knowledgeMapper.selectList(
                new LambdaQueryWrapper<Knowledge>()
                        .eq(Knowledge::getIsActive, true)
                        .and(w -> w
                                .like(Knowledge::getTitle, keyword)
                                .or()
                                .like(Knowledge::getKeywords, keyword)
                        )
                        .last("LIMIT " + limit)
        );
    }

    /**
     * 获取所有启用的知识条目
     */
    public List<Knowledge> listAll() {
        return knowledgeMapper.selectList(
                new LambdaQueryWrapper<Knowledge>()
                        .eq(Knowledge::getIsActive, true)
                        .orderByAsc(Knowledge::getCategory)
        );
    }

    /**
     * 管理员 - 获取全部
     */
    public List<Knowledge> listAllForAdmin() {
        return knowledgeMapper.selectList(
                new LambdaQueryWrapper<Knowledge>()
                        .orderByAsc(Knowledge::getCategory)
        );
    }

    public Knowledge getById(Long id) {
        return knowledgeMapper.selectById(id);
    }

    public void create(Knowledge knowledge) {
        knowledgeMapper.insert(knowledge);
    }

    public void update(Knowledge knowledge) {
        knowledgeMapper.updateById(knowledge);
    }

    public void delete(Long id) {
        knowledgeMapper.deleteById(id);
    }

    /**
     * 统计数量
     */
    public long count() {
        return knowledgeMapper.selectCount(
                new LambdaQueryWrapper<Knowledge>().eq(Knowledge::getIsActive, true)
        );
    }
}
