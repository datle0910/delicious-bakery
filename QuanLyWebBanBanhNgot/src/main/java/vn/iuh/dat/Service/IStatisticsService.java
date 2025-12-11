package vn.iuh.dat.Service;

import vn.iuh.dat.dto.Response.CustomerStatisticsDTO;
import vn.iuh.dat.dto.Response.ProductStatisticsDTO;
import vn.iuh.dat.dto.Response.RevenueStatisticsDTO;

public interface IStatisticsService {
    ProductStatisticsDTO getProductStatistics();
    RevenueStatisticsDTO getRevenueStatistics();
    CustomerStatisticsDTO getCustomerStatistics();
}

