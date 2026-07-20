package com.qlu.campus.service;

import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.qlu.campus.config.AIProperties;
import com.qlu.campus.entity.ChatMessage;
import com.qlu.campus.entity.Knowledge;
import com.qlu.campus.mapper.ChatMessageMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * AI对话服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final AIProperties aiProperties;
    private final KnowledgeService knowledgeService;
    private final ChatMessageMapper chatMessageMapper;

    /**
     * 流式对话
     */
    public SseEmitter chatStream(String sessionId, String message, String ip) {
        SseEmitter emitter = new SseEmitter(300000L); // 5分钟超时

        // 新会话生成ID
        if (StrUtil.isBlank(sessionId)) {
            sessionId = UUID.randomUUID().toString().replace("-", "");
        }

        final String sid = sessionId;

        // 异步执行
        new Thread(() -> {
            try {
                // 1. 保存用户消息
                saveMessage(sid, "user", message, null);

                // 2. 检索相关知识
                List<Knowledge> knowledgeList = searchKnowledge(message);
                String context = buildContext(knowledgeList);

                // 3. 构建Prompt
                String prompt = buildPrompt(message, context);

                // 4. 调用AI流式
                StringBuilder fullResponse = new StringBuilder();
                List<String> sources = knowledgeList.stream()
                        .map(k -> k.getTitle())
                        .collect(Collectors.toList());

                callAIStream(prompt, new AICallback() {
                    @Override
                    public void onToken(String token) {
                        try {
                            emitter.send(SseEmitter.event().data(token));
                            fullResponse.append(token);
                        } catch (Exception e) {
                            log.error("SSE发送失败", e);
                        }
                    }

                    @Override
                    public void onComplete() {
                        try {
                            // 保存AI回复
                            saveMessage(sid, "assistant", fullResponse.toString(),
                                    JSONUtil.toJsonStr(sources));
                            // 发送完成信号
                            emitter.send(SseEmitter.event().name("done").data(sid));
                            emitter.complete();
                        } catch (Exception e) {
                            log.error("完成回调失败", e);
                            emitter.completeWithError(e);
                        }
                    }

                    @Override
                    public void onError(Throwable t) {
                        log.error("AI调用失败", t);
                        emitter.completeWithError(t);
                    }
                });

            } catch (Exception e) {
                log.error("对话处理异常", e);
                try {
                    emitter.send(SseEmitter.event().name("error").data("抱歉，AI服务暂时不可用，请稍后重试"));
                } catch (Exception ignored) {}
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }

    /**
     * 检索知识库
     */
    private List<Knowledge> searchKnowledge(String query) {
        // 先用全文检索
        List<Knowledge> results = knowledgeService.search(query, 5);
        // 全文检索无结果时降级为LIKE模糊搜索
        if (results.isEmpty()) {
            results = knowledgeService.searchByLike(query, 3);
        }
        return results;
    }

    /**
     * 构建知识上下文
     */
    private String buildContext(List<Knowledge> knowledgeList) {
        if (knowledgeList.isEmpty()) {
            return "暂无相关知识库内容。";
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < knowledgeList.size(); i++) {
            Knowledge k = knowledgeList.get(i);
            sb.append("【").append(i + 1).append("】").append(k.getTitle()).append("\n");
            sb.append(k.getContent()).append("\n\n");
        }
        return sb.toString();
    }

    /**
     * 构建System Prompt
     */
    private String buildPrompt(String question, String context) {
        return """
                你是齐鲁工业大学（山东省科学院）的学生校园助手「Mars学长」。
                你的知识来源于齐鲁工业大学官方信息和校园知识库。

                职责：
                1. 回答关于学校概况、院系设置、招生就业等校园信息
                2. 提供校园建筑位置、导航指引
                3. 解答学习生活中的常见问题

                原则：
                - 基于下方参考知识回答，不编造信息
                - 如果知识库中没有相关信息，诚实告知并建议查询官网(www.qlu.edu.cn)
                - 回答简洁清晰，适当使用emoji增加亲和力
                - 涉及地址位置时，引导用户使用校园地图功能

                参考知识：
                %s

                用户问题：%s
                """.formatted(context, question);
    }

    /**
     * 调用AI API流式
     */
    private void callAIStream(String prompt, AICallback callback) {
        try {
            AIProperties.DeepSeekConfig ds = aiProperties.getDeepseek();
            URI uri = URI.create(ds.getBaseUrl() + "/chat/completions");
            HttpURLConnection conn = (HttpURLConnection) uri.toURL().openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Authorization", "Bearer " + ds.getApiKey());
            conn.setDoOutput(true);
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(120000);

            // 构建请求体
            JSONObject body = new JSONObject();
            body.set("model", ds.getModel());
            body.set("stream", true);
            body.set("temperature", 0.3);
            body.set("max_tokens", 2048);

            JSONArray messages = new JSONArray();
            JSONObject sysMsg = new JSONObject();
            sysMsg.set("role", "system");
            sysMsg.set("content", "你是一个有帮助的校园助手。");
            messages.add(sysMsg);

            JSONObject userMsg = new JSONObject();
            userMsg.set("role", "user");
            userMsg.set("content", prompt);
            messages.add(userMsg);

            body.set("messages", messages);

            // 发送请求
            try (OutputStream os = conn.getOutputStream()) {
                os.write(body.toString().getBytes(StandardCharsets.UTF_8));
                os.flush();
            }

            // 读取SSE流式响应
            int status = conn.getResponseCode();
            if (status != 200) {
                // 尝试备用模型
                fallbackToZhipu(prompt, callback);
                return;
            }

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.startsWith("data: ")) {
                        String data = line.substring(6);
                        if ("[DONE]".equals(data)) {
                            callback.onComplete();
                            return;
                        }
                        try {
                            JSONObject chunk = JSONUtil.parseObj(data);
                            JSONArray choices = chunk.getJSONArray("choices");
                            if (choices != null && !choices.isEmpty()) {
                                JSONObject delta = choices.getJSONObject(0).getJSONObject("delta");
                                if (delta != null && delta.containsKey("content")) {
                                    String content = delta.getStr("content");
                                    if (content != null) {
                                        callback.onToken(content);
                                    }
                                }
                            }
                        } catch (Exception ignored) {}
                    }
                }
            }
            callback.onComplete();

        } catch (Exception e) {
            log.error("AI流式调用失败", e);
            fallbackToZhipu(prompt, callback);
        }
    }

    /**
     * 降级到智谱AI
     */
    private void fallbackToZhipu(String prompt, AICallback callback) {
        try {
            AIProperties.ZhipuConfig zhipu = aiProperties.getZhipu();
            URI uri = URI.create(zhipu.getBaseUrl() + "/chat/completions");
            HttpURLConnection conn = (HttpURLConnection) uri.toURL().openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Authorization", "Bearer " + zhipu.getApiKey());
            conn.setDoOutput(true);
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(120000);

            JSONObject body = new JSONObject();
            body.set("model", zhipu.getModel());
            body.set("stream", true);
            body.set("temperature", 0.3);

            JSONArray messages = new JSONArray();
            JSONObject userMsg = new JSONObject();
            userMsg.set("role", "user");
            userMsg.set("content", prompt);
            messages.add(userMsg);
            body.set("messages", messages);

            try (OutputStream os = conn.getOutputStream()) {
                os.write(body.toString().getBytes(StandardCharsets.UTF_8));
                os.flush();
            }

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.startsWith("data: ")) {
                        String data = line.substring(6);
                        if ("[DONE]".equals(data)) {
                            callback.onComplete();
                            return;
                        }
                        try {
                            JSONObject chunk = JSONUtil.parseObj(data);
                            JSONArray choices = chunk.getJSONArray("choices");
                            if (choices != null && !choices.isEmpty()) {
                                JSONObject delta = choices.getJSONObject(0).getJSONObject("delta");
                                if (delta != null && delta.containsKey("content")) {
                                    String content = delta.getStr("content");
                                    if (content != null) {
                                        callback.onToken(content);
                                    }
                                }
                            }
                        } catch (Exception ignored) {}
                    }
                }
            }
            callback.onComplete();

        } catch (Exception e) {
            log.error("备用模型也失败了", e);
            callback.onError(e);
        }
    }

    /**
     * 保存消息
     */
    private void saveMessage(String sessionId, String role, String content, String sources) {
        ChatMessage msg = new ChatMessage();
        msg.setSessionId(sessionId);
        msg.setRole(role);
        msg.setContent(content);
        msg.setSources(sources);
        msg.setCreatedAt(LocalDateTime.now());
        chatMessageMapper.insert(msg);
    }

    /**
     * 获取对话历史
     */
    public List<ChatMessage> getHistory(String sessionId) {
        return chatMessageMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<ChatMessage>()
                        .eq(ChatMessage::getSessionId, sessionId)
                        .orderByAsc(ChatMessage::getCreatedAt)
        );
    }

    /**
     * 提交反馈
     */
    public void feedback(Long messageId, String feedback) {
        ChatMessage msg = chatMessageMapper.selectById(messageId);
        if (msg != null) {
            msg.setFeedback(feedback);
            chatMessageMapper.updateById(msg);
        }
    }

    /**
     * AI流式回调接口
     */
    public interface AICallback {
        void onToken(String token);
        void onComplete();
        void onError(Throwable t);
    }
}
