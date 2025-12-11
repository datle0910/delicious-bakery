package vn.iuh.dat.dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueStatisticsDTO {
    private Double totalRevenue;
    private Double averageOrderValue;
    private Long totalOrders;
    private List<RevenueByPeriodDTO> revenueByMonth;
    private List<RevenueByPeriodDTO> revenueByWeek;
    private List<RevenueByPeriodDTO> revenueByYear;
    private List<RevenueByPeriodDTO> revenueByDay;
}

