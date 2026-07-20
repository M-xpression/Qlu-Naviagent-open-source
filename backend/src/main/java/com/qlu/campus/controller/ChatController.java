package com.qlu.campus.controller;

import com.qlu.campus.entity.ChatMessage;
import com.qlu.campus.service.ChatService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

/**
 * AI对话接口（SSE流式）
 */
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    /** SSE流式对话 */
    @GetMapping("/stream")
    public SseEmitter stream(
            @RequestParam String message,
            @RequestParam(required = false) String sessionId,
            HttpServletRequest request) {
        return chatService.chatStream(sessionId, message, request.getRemoteAddr());
    }

    /** 获取对话历史 */
    @GetMapping("/history")
    public List<ChatMessage> getHistory(@RequestParam String sessionId) {
        return chatService.getHistory(sessionId);
    }

    /** 提交反馈 */
    @PostMapping("/feedback")
    public String feedback(@RequestParam Long messageId, @RequestParam String feedback) {
        chatService.feedback(messageId, feedback);
        return "ok";
    }
}
