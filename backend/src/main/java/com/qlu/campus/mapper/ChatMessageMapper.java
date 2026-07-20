package com.qlu.campus.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.qlu.campus.entity.ChatMessage;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ChatMessageMapper extends BaseMapper<ChatMessage> {
}
