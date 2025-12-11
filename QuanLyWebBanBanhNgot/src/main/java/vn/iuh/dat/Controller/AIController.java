package vn.iuh.dat.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.iuh.dat.Service.AI.AIService;
import vn.iuh.dat.dto.Request.ChatRequest;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AIController {

    private final AIService aiService;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody ChatRequest request) {
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Vui lòng nhập câu hỏi.");
            return ResponseEntity.badRequest().body(error);
        }
        
        String answer = aiService.chat(request.getMessage().trim());
        Map<String, String> response = new HashMap<>();
        response.put("message", answer);
        return ResponseEntity.ok(response);
    }
}
