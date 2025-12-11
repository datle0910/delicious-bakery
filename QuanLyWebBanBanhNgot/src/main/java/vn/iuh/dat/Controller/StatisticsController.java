package vn.iuh.dat.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.iuh.dat.Service.IExportService;
import vn.iuh.dat.Service.IStatisticsService;
import vn.iuh.dat.dto.Response.CustomerStatisticsDTO;
import vn.iuh.dat.dto.Response.ProductStatisticsDTO;
import vn.iuh.dat.dto.Response.RevenueStatisticsDTO;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final IStatisticsService statisticsService;
    private final IExportService exportService;

    @GetMapping("/products")
    public ResponseEntity<ProductStatisticsDTO> getProductStatistics() {
        return ResponseEntity.ok(statisticsService.getProductStatistics());
    }

    @GetMapping("/revenue")
    public ResponseEntity<RevenueStatisticsDTO> getRevenueStatistics() {
        return ResponseEntity.ok(statisticsService.getRevenueStatistics());
    }

    @GetMapping("/customers")
    public ResponseEntity<CustomerStatisticsDTO> getCustomerStatistics() {
        return ResponseEntity.ok(statisticsService.getCustomerStatistics());
    }

    // Excel Export Endpoints
    @GetMapping("/export/products/excel")
    public ResponseEntity<byte[]> exportProductsToExcel() {
        try {
            byte[] data = exportService.exportProductsToExcel().toByteArray();
            String fileName = "ThongKe_SanPham_" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + ".xlsx";
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/export/revenue/excel")
    public ResponseEntity<byte[]> exportRevenueToExcel() {
        try {
            byte[] data = exportService.exportRevenueToExcel().toByteArray();
            String fileName = "ThongKe_DoanhThu_" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + ".xlsx";
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/export/customers/excel")
    public ResponseEntity<byte[]> exportCustomersToExcel() {
        try {
            byte[] data = exportService.exportCustomersToExcel().toByteArray();
            String fileName = "ThongKe_KhachHang_" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + ".xlsx";
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/export/all/excel")
    public ResponseEntity<byte[]> exportAllStatisticsToExcel() {
        try {
            byte[] data = exportService.exportAllStatisticsToExcel().toByteArray();
            String fileName = "ThongKe_TatCa_" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + ".xlsx";
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // PDF Export Endpoints
    @GetMapping("/export/products/pdf")
    public ResponseEntity<byte[]> exportProductsToPDF() {
        try {
            byte[] data = exportService.exportProductsToPDF().toByteArray();
            String fileName = "ThongKe_SanPham_" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + ".pdf";
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/export/revenue/pdf")
    public ResponseEntity<byte[]> exportRevenueToPDF() {
        try {
            byte[] data = exportService.exportRevenueToPDF().toByteArray();
            String fileName = "ThongKe_DoanhThu_" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + ".pdf";
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/export/customers/pdf")
    public ResponseEntity<byte[]> exportCustomersToPDF() {
        try {
            byte[] data = exportService.exportCustomersToPDF().toByteArray();
            String fileName = "ThongKe_KhachHang_" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + ".pdf";
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/export/all/pdf")
    public ResponseEntity<byte[]> exportAllStatisticsToPDF() {
        try {
            byte[] data = exportService.exportAllStatisticsToPDF().toByteArray();
            String fileName = "ThongKe_TatCa_" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + ".pdf";
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}

