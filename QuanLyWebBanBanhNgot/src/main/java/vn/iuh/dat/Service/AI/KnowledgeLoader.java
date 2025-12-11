package vn.iuh.dat.Service.AI;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import vn.iuh.dat.Service.ICategoryService;
import vn.iuh.dat.Service.IProductService;
import vn.iuh.dat.dto.Response.CategoryDTO;
import vn.iuh.dat.dto.Response.ProductDTO;

import org.springframework.core.io.ClassPathResource;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;
import java.util.Scanner;

@Component
@RequiredArgsConstructor
public class KnowledgeLoader {

    private final IProductService productService;
    private final ICategoryService categoryService;
    
    private String cachedKnowledge = null;
    private long cacheTimestamp = 0;
    private static final long CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

    public String loadKnowledge() {
        // Return cached knowledge if still valid
        long currentTime = System.currentTimeMillis();
        if (cachedKnowledge != null && (currentTime - cacheTimestamp) < CACHE_TTL_MS) {
            return cachedKnowledge;
        }
        
        // Reload knowledge
        return reloadKnowledge();
    }
    
    private String reloadKnowledge() {
        StringBuilder knowledge = new StringBuilder();
        
        try {
            // Load static knowledge base from classpath
            ClassPathResource resource = new ClassPathResource("ai/knowledge.md");
            InputStream inputStream = resource.getInputStream();
            Scanner scanner = new Scanner(inputStream, StandardCharsets.UTF_8.name());
            String staticKnowledge = scanner.useDelimiter("\\A").hasNext() ? scanner.next() : "";
            scanner.close();
            knowledge.append(staticKnowledge).append("\n\n");
        } catch (Exception e) {
            knowledge.append("# DeliciousBakery - Knowledge Base\n\n");
        }

        // Load dynamic data from database
        knowledge.append("## DANH SÁCH SẢN PHẨM HIỆN CÓ:\n\n");
        
        try {
            List<CategoryDTO> categories = categoryService.findAll();
            List<ProductDTO> products = productService.findAll();
            
            NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
            
            // Group products by category
            for (CategoryDTO category : categories) {
                knowledge.append("### ").append(category.getName()).append("\n");
                
                List<ProductDTO> categoryProducts = products.stream()
                    .filter(p -> p.getCategoryId().equals(category.getId()))
                    .toList();
                
                if (categoryProducts.isEmpty()) {
                    knowledge.append("- Hiện chưa có sản phẩm nào trong danh mục này.\n\n");
                } else {
                    for (ProductDTO product : categoryProducts) {
                        knowledge.append("- **").append(product.getName()).append("**");
                        knowledge.append(" - Giá: ").append(formatPrice(product.getPrice()));
                        knowledge.append(" - Tồn kho: ").append(product.getStock()).append(" sản phẩm");
                        if (product.getDescription() != null && !product.getDescription().isEmpty()) {
                            knowledge.append("\n  Mô tả: ").append(product.getDescription());
                        }
                        knowledge.append("\n");
                    }
                    knowledge.append("\n");
                }
            }
            
            // Add summary statistics
            knowledge.append("## THỐNG KÊ:\n");
            knowledge.append("- Tổng số danh mục: ").append(categories.size()).append("\n");
            knowledge.append("- Tổng số sản phẩm: ").append(products.size()).append("\n");
            knowledge.append("- Số sản phẩm còn hàng: ")
                .append(products.stream().mapToInt(ProductDTO::getStock).sum()).append("\n");
            
        } catch (Exception e) {
            knowledge.append("Lỗi khi tải dữ liệu sản phẩm: ").append(e.getMessage()).append("\n");
        }

        String result = knowledge.toString();
        
        // Cache the result
        cachedKnowledge = result;
        cacheTimestamp = System.currentTimeMillis();
        
        return result;
    }
    
    // Refresh cache every 5 minutes
    @Scheduled(fixedRate = 300000) // 5 minutes in milliseconds
    public void refreshCache() {
        reloadKnowledge();
    }
    
    private String formatPrice(double price) {
        NumberFormat formatter = NumberFormat.getNumberInstance(new Locale("vi", "VN"));
        return formatter.format(price) + " VNĐ";
    }
}
