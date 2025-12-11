package vn.iuh.dat.Service.AI;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

    private final KnowledgeLoader knowledgeLoader;
    private final RestTemplate restTemplate;

    @Value("${ai.provider:ollama}")
    private String aiProvider;

    @Value("${ai.ollama.url:http://localhost:11434}")
    private String ollamaUrl;

    @Value("${ai.ollama.model:phi3}")
    private String ollamaModel;

    @Value("${ai.ollama.num-predict:300}")
    private Integer ollamaNumPredict;

    @Value("${ai.ollama.temperature:0.3}")
    private Double ollamaTemperature;

    @Value("${ai.ollama.top-p:0.9}")
    private Double ollamaTopP;

    @Value("${ai.openai.api-key:}")
    private String openaiApiKey;

    @Value("${ai.openai.model:gpt-3.5-turbo}")
    private String openaiModel;

    public String chat(String userMessage) {
        try {
            String systemPrompt = buildSystemPrompt(userMessage);
            
            return switch (aiProvider.toLowerCase()) {
                case "ollama" -> chatWithOllama(systemPrompt);
                case "openai" -> chatWithOpenAI(userMessage, systemPrompt);
                default -> chatWithOllama(systemPrompt);
            };
        } catch (Exception e) {
            log.error("Error in AI chat service", e);
            return "Xin lỗi, hiện tại tôi không trả lời được. Vui lòng thử lại sau.";
        }
    }

    private String buildSystemPrompt(String userMessage) {
        String knowledge = knowledgeLoader.loadKnowledge();
        
        // Very strict prompt to prevent off-topic responses
        return """ 
Bạn là trợ lý AI của DeliciousBakery - website bán bánh ngọt trực tuyến.

NHIỆM VỤ DUY NHẤT: Chỉ trả lời câu hỏi về DeliciousBakery dựa trên kiến thức bên dưới.

KIẾN THỨC VỀ DELICIOUSBAKERY:
""" + knowledge + """

QUY TẮC NGHIÊM NGẶT:
1. CHỈ trả lời về: sản phẩm bánh, đơn hàng, thanh toán, giao hàng, giỏ hàng, tài khoản của DeliciousBakery
2. Nếu câu hỏi KHÔNG liên quan đến DeliciousBakery → trả lời CHÍNH XÁC: "Xin lỗi, tôi chỉ hỗ trợ các câu hỏi liên quan đến DeliciousBakery."
3. KHÔNG được nói về: Microsoft, fertilizer, nitrate, blog posts, hay bất kỳ chủ đề nào khác ngoài DeliciousBakery
4. KHÔNG được bịa đặt thông tin. Chỉ dùng thông tin trong kiến thức trên.
5. Trả lời bằng tiếng Việt, ngắn gọn (tối đa 3-4 câu), thân thiện.

Câu hỏi của người dùng: """ + userMessage + """

Bạn phải trả lời CHỈ về DeliciousBakery. Nếu không liên quan, nói "Xin lỗi, tôi chỉ hỗ trợ các câu hỏi liên quan đến DeliciousBakery."

Trả lời:""";
    }

    private String chatWithOllama(String prompt) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("model", ollamaModel);
            body.put("prompt", prompt);
            body.put("stream", false);
            
            // Optimization parameters for faster response
            body.put("num_predict", ollamaNumPredict); // Limit max tokens (default 300)
            body.put("temperature", ollamaTemperature); // Lower = more deterministic (default 0.7)
            body.put("top_p", ollamaTopP); // Nucleus sampling (default 0.9)
            body.put("num_ctx", 2048); // Context window size (smaller = faster)
            body.put("repeat_penalty", 1.1); // Reduce repetition

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                    ollamaUrl + "/api/generate",
                    body,
                    Map.class
            );

            if (response == null || response.get("response") == null) {
                return "Xin lỗi, hiện tại tôi không trả lời được. Vui lòng thử lại sau.";
            }

            String answer = response.get("response").toString().trim();
            
            // Clean up the response if it contains extra text
            if (answer.contains("Trả lời:")) {
                answer = answer.substring(answer.indexOf("Trả lời:") + 8).trim();
            }
            if (answer.contains("AI:")) {
                answer = answer.substring(answer.indexOf("AI:") + 3).trim();
            }
            
            // Validate response - check if it's off-topic
            answer = validateAndFilterResponse(answer);
            
            // Limit response length for faster display
            if (answer.length() > 500) {
                answer = answer.substring(0, 497) + "...";
            }
            
            return answer;
        } catch (RestClientException e) {
            log.error("Error calling Ollama API", e);
            return "Xin lỗi, dịch vụ AI tạm thời không khả dụng. Vui lòng thử lại sau.";
        }
    }
    
    /**
     * Validate and filter response to ensure it's on-topic
     */
    private String validateAndFilterResponse(String response) {
        if (response == null || response.trim().isEmpty()) {
            return "Xin lỗi, tôi không hiểu câu hỏi. Vui lòng hỏi về sản phẩm, đơn hàng, hoặc dịch vụ của DeliciousBakery.";
        }
        
        String lowerResponse = response.toLowerCase();
        
        // Check for off-topic keywords that indicate hallucination
        String[] offTopicKeywords = {
            "microsoft", "fertilizer", "nitrate", "blog post", "in vitro", 
            "water-soluble", "instruction set", "natural language processing",
            "developed by", "french", "3456g", "output format"
        };
        
        for (String keyword : offTopicKeywords) {
            if (lowerResponse.contains(keyword.toLowerCase())) {
                log.warn("Detected off-topic response, filtering: {}", response.substring(0, Math.min(100, response.length())));
                return "Xin lỗi, tôi chỉ hỗ trợ các câu hỏi liên quan đến DeliciousBakery. Vui lòng hỏi về sản phẩm, đơn hàng, thanh toán, hoặc dịch vụ của chúng tôi.";
            }
        }
        
        // Check if response mentions DeliciousBakery or bakery-related terms
        String[] bakeryKeywords = {
            "deliciousbakery", "bánh", "sản phẩm", "đơn hàng", "thanh toán", 
            "giao hàng", "giỏ hàng", "tài khoản", "khách hàng", "cupcake",
            "macaron", "tart", "bánh kem", "bánh ngọt"
        };
        
        boolean hasBakeryContext = false;
        for (String keyword : bakeryKeywords) {
            if (lowerResponse.contains(keyword.toLowerCase())) {
                hasBakeryContext = true;
                break;
            }
        }
        
        // If response is too long and doesn't mention bakery terms, it might be off-topic
        if (!hasBakeryContext && response.length() > 100) {
            log.warn("Response seems off-topic (no bakery context): {}", response.substring(0, Math.min(100, response.length())));
            return "Xin lỗi, tôi chỉ hỗ trợ các câu hỏi liên quan đến DeliciousBakery. Vui lòng hỏi về sản phẩm, đơn hàng, thanh toán, hoặc dịch vụ của chúng tôi.";
        }
        
        return response;
    }

    private String chatWithOpenAI(String userMessage, String systemPrompt) {
        if (openaiApiKey == null || openaiApiKey.isEmpty()) {
            log.warn("OpenAI API key not configured, falling back to Ollama");
            return chatWithOllama(systemPrompt);
        }

        try {
            Map<String, Object> body = new HashMap<>();
            body.put("model", openaiModel);
            
            Map<String, String> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", systemPrompt);
            
            Map<String, String> userMsg = new HashMap<>();
            userMsg.put("role", "user");
            userMsg.put("content", userMessage);
            
            body.put("messages", java.util.List.of(systemMessage, userMsg));
            body.put("temperature", 0.7);
            body.put("max_tokens", 500);

            Map<String, String> headers = new HashMap<>();
            headers.put("Authorization", "Bearer " + openaiApiKey);
            headers.put("Content-Type", "application/json");

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                    "https://api.openai.com/v1/chat/completions",
                    body,
                    Map.class
            );

            if (response == null || !response.containsKey("choices")) {
                return "Xin lỗi, hiện tại tôi không trả lời được. Vui lòng thử lại sau.";
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> choice = ((java.util.List<Map<String, Object>>) response.get("choices")).get(0);
            @SuppressWarnings("unchecked")
            Map<String, Object> message = (Map<String, Object>) choice.get("message");
            
            return message.get("content").toString().trim();
        } catch (RestClientException e) {
            log.error("Error calling OpenAI API", e);
            return "Xin lỗi, dịch vụ AI tạm thời không khả dụng. Vui lòng thử lại sau.";
        }
    }
}
