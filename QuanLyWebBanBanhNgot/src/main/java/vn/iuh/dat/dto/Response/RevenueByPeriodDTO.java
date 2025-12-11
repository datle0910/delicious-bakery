package vn.iuh.dat.dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueByPeriodDTO {
    private String period; // "2024-01", "2024-W01", "2024", "2024-01-15"
    private Double revenue;
    private Long orderCount;
}

