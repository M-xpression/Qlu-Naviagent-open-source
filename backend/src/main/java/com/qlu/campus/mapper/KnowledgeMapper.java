package com.qlu.campus.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.qlu.campus.entity.Knowledge;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface KnowledgeMapper extends BaseMapper<Knowledge> {

    /**
     * MySQL全文检索知识库
     */
    @Select("SELECT *, MATCH(title, content, keywords) AGAINST(#{keyword} IN BOOLEAN MODE) AS relevance " +
            "FROM knowledge " +
            "WHERE is_active = 1 " +
            "  AND MATCH(title, content, keywords) AGAINST(#{keyword} IN BOOLEAN MODE) " +
            "ORDER BY relevance DESC LIMIT #{limit}")
    List<Knowledge> fullTextSearch(@Param("keyword") String keyword, @Param("limit") int limit);
}
