package vn.iuh.dat.Service;

import java.io.ByteArrayOutputStream;

public interface IExportService {
    ByteArrayOutputStream exportProductsToExcel();
    ByteArrayOutputStream exportRevenueToExcel();
    ByteArrayOutputStream exportCustomersToExcel();
    ByteArrayOutputStream exportAllStatisticsToExcel();
    
    ByteArrayOutputStream exportProductsToPDF();
    ByteArrayOutputStream exportRevenueToPDF();
    ByteArrayOutputStream exportCustomersToPDF();
    ByteArrayOutputStream exportAllStatisticsToPDF();
}

