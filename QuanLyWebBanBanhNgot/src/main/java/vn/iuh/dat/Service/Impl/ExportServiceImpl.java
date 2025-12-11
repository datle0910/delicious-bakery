package vn.iuh.dat.Service.Impl;

import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import vn.iuh.dat.Service.IExportService;
import vn.iuh.dat.Service.IStatisticsService;
import vn.iuh.dat.dto.Response.*;

import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;


@Service
@RequiredArgsConstructor
public class ExportServiceImpl implements IExportService {

    private final IStatisticsService statisticsService;
    private static final NumberFormat currencyFormatter = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
    private static final String VIETNAMESE_FONT_PATH = "fonts/NotoSans.ttf";

    private String formatCurrency(double amount) {
        return currencyFormatter.format(amount);
    }

    // ==================== EXCEL EXPORTS ====================

    @Override
    public ByteArrayOutputStream exportProductsToExcel() {
        ProductStatisticsDTO stats = statisticsService.getProductStatistics();
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Sản phẩm");

        int rowNum = 0;
        Row row;
        Cell cell;

        // Title
        row = sheet.createRow(rowNum++);
        cell = row.createCell(0);
        cell.setCellValue("Thống kê sản phẩm");
        CellStyle titleStyle = workbook.createCellStyle();
        Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 16);
        titleStyle.setFont(titleFont);
        cell.setCellStyle(titleStyle);

        rowNum++; // Empty row

        // Summary
        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Tổng sản phẩm");
        row.createCell(1).setCellValue(stats.getTotalProducts());

        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Tồn kho thấp");
        row.createCell(1).setCellValue(stats.getLowStockProducts());

        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Hết hàng");
        row.createCell(1).setCellValue(stats.getOutOfStockProducts());

        rowNum++; // Empty row

        // Best Selling Products
        row = sheet.createRow(rowNum++);
        cell = row.createCell(0);
        cell.setCellValue("Top 10 sản phẩm bán chạy nhất");
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 12);
        headerStyle.setFont(headerFont);
        cell.setCellStyle(headerStyle);

        row = sheet.createRow(rowNum++);
        String[] headers = {"Sản phẩm", "Số lượng đã bán", "Doanh thu", "Số lần mua", "Tồn kho"};
        for (int i = 0; i < headers.length; i++) {
            cell = row.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        for (TopProductDTO product : stats.getBestSellingProducts()) {
            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(product.getProductName());
            row.createCell(1).setCellValue(product.getTotalQuantitySold());
            row.createCell(2).setCellValue(formatCurrency(product.getTotalRevenue()));
            row.createCell(3).setCellValue(product.getPurchaseCount());
            row.createCell(4).setCellValue(product.getCurrentStock());
        }

        rowNum++; // Empty row

        // Top Products by Purchase Count
        row = sheet.createRow(rowNum++);
        cell = row.createCell(0);
        cell.setCellValue("Top 10 sản phẩm có số lần mua nhiều nhất");
        cell.setCellStyle(headerStyle);

        row = sheet.createRow(rowNum++);
        String[] headers2 = {"Sản phẩm", "Số lần mua", "Số lượng đã bán", "Doanh thu", "Tồn kho"};
        for (int i = 0; i < headers2.length; i++) {
            cell = row.createCell(i);
            cell.setCellValue(headers2[i]);
            cell.setCellStyle(headerStyle);
        }

        for (TopProductDTO product : stats.getTopProductsByPurchaseCount()) {
            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(product.getProductName());
            row.createCell(1).setCellValue(product.getPurchaseCount());
            row.createCell(2).setCellValue(product.getTotalQuantitySold());
            row.createCell(3).setCellValue(formatCurrency(product.getTotalRevenue()));
            row.createCell(4).setCellValue(product.getCurrentStock());
        }

        rowNum++; // Empty row

        // Slow Selling Products
        row = sheet.createRow(rowNum++);
        cell = row.createCell(0);
        cell.setCellValue("Sản phẩm bán chậm");
        cell.setCellStyle(headerStyle);

        row = sheet.createRow(rowNum++);
        String[] headers3 = {"Sản phẩm", "Số lượng đã bán", "Doanh thu", "Tồn kho"};
        for (int i = 0; i < headers3.length; i++) {
            cell = row.createCell(i);
            cell.setCellValue(headers3[i]);
            cell.setCellStyle(headerStyle);
        }

        for (TopProductDTO product : stats.getSlowSellingProducts()) {
            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(product.getProductName());
            row.createCell(1).setCellValue(product.getTotalQuantitySold());
            row.createCell(2).setCellValue(formatCurrency(product.getTotalRevenue()));
            row.createCell(3).setCellValue(product.getCurrentStock());
        }

        // Auto-size columns
        for (int i = 0; i < 5; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try {
            workbook.write(outputStream);
            workbook.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Excel file", e);
        }
        return outputStream;
    }

    @Override
    public ByteArrayOutputStream exportRevenueToExcel() {
        RevenueStatisticsDTO stats = statisticsService.getRevenueStatistics();
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Doanh thu");

        int rowNum = 0;
        Row row;
        Cell cell;

        // Title
        row = sheet.createRow(rowNum++);
        cell = row.createCell(0);
        cell.setCellValue("Thống kê doanh thu");
        CellStyle titleStyle = workbook.createCellStyle();
        Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 16);
        titleStyle.setFont(titleFont);
        cell.setCellStyle(titleStyle);

        rowNum++; // Empty row

        // Summary
        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Tổng doanh thu");
        row.createCell(1).setCellValue(formatCurrency(stats.getTotalRevenue()));

        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Tổng đơn hàng");
        row.createCell(1).setCellValue(stats.getTotalOrders());

        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Giá trị đơn hàng trung bình");
        row.createCell(1).setCellValue(formatCurrency(stats.getAverageOrderValue()));

        rowNum++; // Empty row

        // Revenue by Month
        row = sheet.createRow(rowNum++);
        cell = row.createCell(0);
        cell.setCellValue("Doanh thu theo tháng");
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 12);
        headerStyle.setFont(headerFont);
        cell.setCellStyle(headerStyle);

        row = sheet.createRow(rowNum++);
        String[] headers = {"Tháng", "Doanh thu", "Số đơn hàng"};
        for (int i = 0; i < headers.length; i++) {
            cell = row.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        for (RevenueByPeriodDTO period : stats.getRevenueByMonth()) {
            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(period.getPeriod());
            row.createCell(1).setCellValue(formatCurrency(period.getRevenue()));
            row.createCell(2).setCellValue(period.getOrderCount());
        }

        rowNum++; // Empty row

        // Revenue by Year
        row = sheet.createRow(rowNum++);
        cell = row.createCell(0);
        cell.setCellValue("Doanh thu theo năm");
        cell.setCellStyle(headerStyle);

        row = sheet.createRow(rowNum++);
        String[] headers2 = {"Năm", "Doanh thu", "Số đơn hàng"};
        for (int i = 0; i < headers2.length; i++) {
            cell = row.createCell(i);
            cell.setCellValue(headers2[i]);
            cell.setCellStyle(headerStyle);
        }

        for (RevenueByPeriodDTO period : stats.getRevenueByYear()) {
            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(period.getPeriod());
            row.createCell(1).setCellValue(formatCurrency(period.getRevenue()));
            row.createCell(2).setCellValue(period.getOrderCount());
        }

        // Auto-size columns
        for (int i = 0; i < 3; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try {
            workbook.write(outputStream);
            workbook.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Excel file", e);
        }
        return outputStream;
    }

    @Override
    public ByteArrayOutputStream exportCustomersToExcel() {
        CustomerStatisticsDTO stats = statisticsService.getCustomerStatistics();
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Khách hàng");

        int rowNum = 0;
        Row row;
        Cell cell;

        // Title
        row = sheet.createRow(rowNum++);
        cell = row.createCell(0);
        cell.setCellValue("Thống kê khách hàng");
        CellStyle titleStyle = workbook.createCellStyle();
        Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 16);
        titleStyle.setFont(titleFont);
        cell.setCellStyle(titleStyle);

        rowNum++; // Empty row

        // Summary
        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Tổng khách hàng");
        row.createCell(1).setCellValue(stats.getTotalCustomers());

        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Khách hàng hoạt động");
        row.createCell(1).setCellValue(stats.getActiveCustomers());

        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Khách hàng mới (30 ngày)");
        row.createCell(1).setCellValue(stats.getNewCustomers());

        rowNum++; // Empty row

        // Top Customers by Purchase Count
        row = sheet.createRow(rowNum++);
        cell = row.createCell(0);
        cell.setCellValue("Top 10 khách hàng có số lần mua nhiều nhất");
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 12);
        headerStyle.setFont(headerFont);
        cell.setCellStyle(headerStyle);

        row = sheet.createRow(rowNum++);
        String[] headers = {"Khách hàng", "Email", "Số lần mua", "Tổng chi tiêu"};
        for (int i = 0; i < headers.length; i++) {
            cell = row.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        for (TopCustomerDTO customer : stats.getTopCustomersByPurchaseCount()) {
            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(customer.getCustomerName());
            row.createCell(1).setCellValue(customer.getCustomerEmail());
            row.createCell(2).setCellValue(customer.getPurchaseCount());
            row.createCell(3).setCellValue(formatCurrency(customer.getTotalSpending()));
        }

        rowNum++; // Empty row

        // Top Customers by Spending
        row = sheet.createRow(rowNum++);
        cell = row.createCell(0);
        cell.setCellValue("Top 10 khách hàng có tổng chi tiêu cao nhất");
        cell.setCellStyle(headerStyle);

        row = sheet.createRow(rowNum++);
        String[] headers2 = {"Khách hàng", "Email", "Số lần mua", "Tổng chi tiêu"};
        for (int i = 0; i < headers2.length; i++) {
            cell = row.createCell(i);
            cell.setCellValue(headers2[i]);
            cell.setCellStyle(headerStyle);
        }

        for (TopCustomerDTO customer : stats.getTopCustomersByTotalSpending()) {
            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(customer.getCustomerName());
            row.createCell(1).setCellValue(customer.getCustomerEmail());
            row.createCell(2).setCellValue(customer.getPurchaseCount());
            row.createCell(3).setCellValue(formatCurrency(customer.getTotalSpending()));
        }

        // Auto-size columns
        for (int i = 0; i < 4; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try {
            workbook.write(outputStream);
            workbook.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Excel file", e);
        }
        return outputStream;
    }

    @Override
    public ByteArrayOutputStream exportAllStatisticsToExcel() {
        Workbook workbook = new XSSFWorkbook();

        // Products Sheet
        ProductStatisticsDTO productStats = statisticsService.getProductStatistics();
        Sheet productSheet = workbook.createSheet("Sản phẩm");
        populateProductSheet(productSheet, productStats, workbook);

        // Revenue Sheet
        RevenueStatisticsDTO revenueStats = statisticsService.getRevenueStatistics();
        Sheet revenueSheet = workbook.createSheet("Doanh thu");
        populateRevenueSheet(revenueSheet, revenueStats, workbook);

        // Customers Sheet
        CustomerStatisticsDTO customerStats = statisticsService.getCustomerStatistics();
        Sheet customerSheet = workbook.createSheet("Khách hàng");
        populateCustomerSheet(customerSheet, customerStats, workbook);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try {
            workbook.write(outputStream);
            workbook.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Excel file", e);
        }
        return outputStream;
    }

    private void populateProductSheet(Sheet sheet, ProductStatisticsDTO stats, Workbook workbook) {
        int rowNum = 0;
        Row row = sheet.createRow(rowNum++);
        Cell cell = row.createCell(0);
        cell.setCellValue("Thống kê sản phẩm");
        CellStyle titleStyle = workbook.createCellStyle();
        Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 16);
        titleStyle.setFont(titleFont);
        cell.setCellStyle(titleStyle);

        rowNum++;
        sheet.createRow(rowNum++).createCell(0).setCellValue("Tổng sản phẩm");
        sheet.getRow(rowNum - 1).createCell(1).setCellValue(stats.getTotalProducts());
        sheet.createRow(rowNum++).createCell(0).setCellValue("Tồn kho thấp");
        sheet.getRow(rowNum - 1).createCell(1).setCellValue(stats.getLowStockProducts());
        sheet.createRow(rowNum++).createCell(0).setCellValue("Hết hàng");
        sheet.getRow(rowNum - 1).createCell(1).setCellValue(stats.getOutOfStockProducts());

        // Best selling products table
        rowNum++;
        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Top 10 sản phẩm bán chạy nhất");
        row = sheet.createRow(rowNum++);
        String[] headers = {"Sản phẩm", "Số lượng đã bán", "Doanh thu", "Số lần mua", "Tồn kho"};
        CellStyle headerStyle = createHeaderStyle(workbook);
        for (int i = 0; i < headers.length; i++) {
            cell = row.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        for (TopProductDTO product : stats.getBestSellingProducts()) {
            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(product.getProductName());
            row.createCell(1).setCellValue(product.getTotalQuantitySold());
            row.createCell(2).setCellValue(formatCurrency(product.getTotalRevenue()));
            row.createCell(3).setCellValue(product.getPurchaseCount());
            row.createCell(4).setCellValue(product.getCurrentStock());
        }

        for (int i = 0; i < 5; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private void populateRevenueSheet(Sheet sheet, RevenueStatisticsDTO stats, Workbook workbook) {
        int rowNum = 0;
        Row row = sheet.createRow(rowNum++);
        Cell cell = row.createCell(0);
        cell.setCellValue("Thống kê doanh thu");
        CellStyle titleStyle = workbook.createCellStyle();
        Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 16);
        titleStyle.setFont(titleFont);
        cell.setCellStyle(titleStyle);

        rowNum++;
        sheet.createRow(rowNum++).createCell(0).setCellValue("Tổng doanh thu");
        sheet.getRow(rowNum - 1).createCell(1).setCellValue(formatCurrency(stats.getTotalRevenue()));
        sheet.createRow(rowNum++).createCell(0).setCellValue("Tổng đơn hàng");
        sheet.getRow(rowNum - 1).createCell(1).setCellValue(stats.getTotalOrders());
        sheet.createRow(rowNum++).createCell(0).setCellValue("Giá trị đơn hàng trung bình");
        sheet.getRow(rowNum - 1).createCell(1).setCellValue(formatCurrency(stats.getAverageOrderValue()));

        // Revenue by month
        rowNum++;
        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Doanh thu theo tháng");
        row = sheet.createRow(rowNum++);
        String[] headers = {"Tháng", "Doanh thu", "Số đơn hàng"};
        CellStyle headerStyle = createHeaderStyle(workbook);
        for (int i = 0; i < headers.length; i++) {
            cell = row.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        for (RevenueByPeriodDTO period : stats.getRevenueByMonth()) {
            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(period.getPeriod());
            row.createCell(1).setCellValue(formatCurrency(period.getRevenue()));
            row.createCell(2).setCellValue(period.getOrderCount());
        }

        for (int i = 0; i < 3; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private void populateCustomerSheet(Sheet sheet, CustomerStatisticsDTO stats, Workbook workbook) {
        int rowNum = 0;
        Row row = sheet.createRow(rowNum++);
        Cell cell = row.createCell(0);
        cell.setCellValue("Thống kê khách hàng");
        CellStyle titleStyle = workbook.createCellStyle();
        Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 16);
        titleStyle.setFont(titleFont);
        cell.setCellStyle(titleStyle);

        rowNum++;
        sheet.createRow(rowNum++).createCell(0).setCellValue("Tổng khách hàng");
        sheet.getRow(rowNum - 1).createCell(1).setCellValue(stats.getTotalCustomers());
        sheet.createRow(rowNum++).createCell(0).setCellValue("Khách hàng hoạt động");
        sheet.getRow(rowNum - 1).createCell(1).setCellValue(stats.getActiveCustomers());
        sheet.createRow(rowNum++).createCell(0).setCellValue("Khách hàng mới (30 ngày)");
        sheet.getRow(rowNum - 1).createCell(1).setCellValue(stats.getNewCustomers());

        // Top customers
        rowNum++;
        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Top 10 khách hàng có tổng chi tiêu cao nhất");
        row = sheet.createRow(rowNum++);
        String[] headers = {"Khách hàng", "Email", "Số lần mua", "Tổng chi tiêu"};
        CellStyle headerStyle = createHeaderStyle(workbook);
        for (int i = 0; i < headers.length; i++) {
            cell = row.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        for (TopCustomerDTO customer : stats.getTopCustomersByTotalSpending()) {
            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(customer.getCustomerName());
            row.createCell(1).setCellValue(customer.getCustomerEmail());
            row.createCell(2).setCellValue(customer.getPurchaseCount());
            row.createCell(3).setCellValue(formatCurrency(customer.getTotalSpending()));
        }

        for (int i = 0; i < 4; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 12);
        headerStyle.setFont(headerFont);
        return headerStyle;
    }

    // ==================== PDF FONT (UNICODE) ====================
    private PdfFont getVietnameseFont() {
        try {
            ClassPathResource resource = new ClassPathResource(VIETNAMESE_FONT_PATH);
            try (InputStream is = resource.getInputStream()) {
                byte[] fontBytes = is.readAllBytes();

                // iText 8: dùng đúng overload (byte[], String)
                return PdfFontFactory.createFont(fontBytes, PdfEncodings.IDENTITY_H);
            }
        } catch (Exception e) {
            throw new RuntimeException("Không thể tải font tiếng Việt cho PDF", e);
        }
    }


    private Document createVietnamesePdfDocument(ByteArrayOutputStream outputStream) {
        try {
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            PdfFont font = getVietnameseFont();
            document.setFont(font);
            document.setFontSize(11);

            return document;
        } catch (Exception e) {
            throw new RuntimeException("Không thể khởi tạo tài liệu PDF", e);
        }
    }

    // ==================== PDF EXPORTS ====================

    @Override
    public ByteArrayOutputStream exportProductsToPDF() {
        ProductStatisticsDTO stats = statisticsService.getProductStatistics();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        try {
            Document document = createVietnamesePdfDocument(outputStream);

            // Title
            document.add(new Paragraph("BÁO CÁO THỐNG KÊ SẢN PHẨM")
                    .setFontSize(18).setBold());
            document.add(new Paragraph("Ngày xuất: " +
                    LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                    .setFontSize(10));
            document.add(new Paragraph("\n"));

            // Summary
            document.add(new Paragraph("Tổng quan").setFontSize(12).setBold());
            document.add(new Paragraph("Tổng sản phẩm: " + stats.getTotalProducts()));
            document.add(new Paragraph("Tồn kho thấp: " + stats.getLowStockProducts()));
            document.add(new Paragraph("Hết hàng: " + stats.getOutOfStockProducts()));
            document.add(new Paragraph("\n"));

            // Best Selling Products Table
            document.add(new Paragraph("Top 10 sản phẩm bán chạy nhất").setFontSize(12).setBold());
            Table bestSellingTable = new Table(UnitValue.createPercentArray(new float[]{3, 1, 1.5f, 1, 1}));
            bestSellingTable.addHeaderCell("Sản phẩm");
            bestSellingTable.addHeaderCell("Số lượng");
            bestSellingTable.addHeaderCell("Doanh thu");
            bestSellingTable.addHeaderCell("Số lần mua");
            bestSellingTable.addHeaderCell("Tồn kho");

            for (TopProductDTO product : stats.getBestSellingProducts()) {
                String name = product.getProductName();
                if (name != null && name.length() > 30) {
                    name = name.substring(0, 30) + "...";
                }
                bestSellingTable.addCell(name != null ? name : "");
                bestSellingTable.addCell(String.valueOf(product.getTotalQuantitySold()));
                bestSellingTable.addCell(formatCurrency(product.getTotalRevenue()));
                bestSellingTable.addCell(String.valueOf(product.getPurchaseCount()));
                bestSellingTable.addCell(String.valueOf(product.getCurrentStock()));
            }
            document.add(bestSellingTable);
            document.add(new Paragraph("\n"));

            // Top Products by Purchase Count Table
            document.add(new Paragraph("Top 10 sản phẩm có số lần mua nhiều nhất").setFontSize(12).setBold());
            Table purchaseCountTable = new Table(UnitValue.createPercentArray(new float[]{3, 1, 1, 1.5f, 1}));
            purchaseCountTable.addHeaderCell("Sản phẩm");
            purchaseCountTable.addHeaderCell("Số lần mua");
            purchaseCountTable.addHeaderCell("Số lượng");
            purchaseCountTable.addHeaderCell("Doanh thu");
            purchaseCountTable.addHeaderCell("Tồn kho");

            for (TopProductDTO product : stats.getTopProductsByPurchaseCount()) {
                String name = product.getProductName();
                if (name != null && name.length() > 30) {
                    name = name.substring(0, 30) + "...";
                }
                purchaseCountTable.addCell(name != null ? name : "");
                purchaseCountTable.addCell(String.valueOf(product.getPurchaseCount()));
                purchaseCountTable.addCell(String.valueOf(product.getTotalQuantitySold()));
                purchaseCountTable.addCell(formatCurrency(product.getTotalRevenue()));
                purchaseCountTable.addCell(String.valueOf(product.getCurrentStock()));
            }
            document.add(purchaseCountTable);
            document.add(new Paragraph("\n"));

            // Slow Selling Products Table
            document.add(new Paragraph("Sản phẩm bán chậm").setFontSize(12).setBold());
            Table slowSellingTable = new Table(UnitValue.createPercentArray(new float[]{3, 1, 1.5f, 1}));
            slowSellingTable.addHeaderCell("Sản phẩm");
            slowSellingTable.addHeaderCell("Số lượng");
            slowSellingTable.addHeaderCell("Doanh thu");
            slowSellingTable.addHeaderCell("Tồn kho");

            for (TopProductDTO product : stats.getSlowSellingProducts()) {
                String name = product.getProductName();
                if (name != null && name.length() > 30) {
                    name = name.substring(0, 30) + "...";
                }
                slowSellingTable.addCell(name != null ? name : "");
                slowSellingTable.addCell(String.valueOf(product.getTotalQuantitySold()));
                slowSellingTable.addCell(formatCurrency(product.getTotalRevenue()));
                slowSellingTable.addCell(String.valueOf(product.getCurrentStock()));
            }
            document.add(slowSellingTable);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF file", e);
        }

        return outputStream;
    }

    @Override
    public ByteArrayOutputStream exportRevenueToPDF() {
        RevenueStatisticsDTO stats = statisticsService.getRevenueStatistics();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        try {
            Document document = createVietnamesePdfDocument(outputStream);

            // Title
            document.add(new Paragraph("BÁO CÁO THỐNG KÊ DOANH THU")
                    .setFontSize(18).setBold());
            document.add(new Paragraph("Ngày xuất: " +
                    LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                    .setFontSize(10));
            document.add(new Paragraph("\n"));

            // Summary
            document.add(new Paragraph("Tổng quan").setFontSize(12).setBold());
            document.add(new Paragraph("Tổng doanh thu: " + formatCurrency(stats.getTotalRevenue())));
            document.add(new Paragraph("Tổng đơn hàng: " + stats.getTotalOrders()));
            document.add(new Paragraph("Giá trị đơn hàng trung bình: " +
                    formatCurrency(stats.getAverageOrderValue())));
            document.add(new Paragraph("\n"));

            // Revenue by Month Table
            document.add(new Paragraph("Doanh thu theo tháng").setFontSize(12).setBold());
            Table monthTable = new Table(UnitValue.createPercentArray(new float[]{2, 2, 1}));
            monthTable.addHeaderCell("Tháng");
            monthTable.addHeaderCell("Doanh thu");
            monthTable.addHeaderCell("Số đơn hàng");

            for (RevenueByPeriodDTO period : stats.getRevenueByMonth()) {
                monthTable.addCell(period.getPeriod());
                monthTable.addCell(formatCurrency(period.getRevenue()));
                monthTable.addCell(String.valueOf(period.getOrderCount()));
            }
            document.add(monthTable);
            document.add(new Paragraph("\n"));

            // Revenue by Year Table
            document.add(new Paragraph("Doanh thu theo năm").setFontSize(12).setBold());
            Table yearTable = new Table(UnitValue.createPercentArray(new float[]{2, 2, 1}));
            yearTable.addHeaderCell("Năm");
            yearTable.addHeaderCell("Doanh thu");
            yearTable.addHeaderCell("Số đơn hàng");

            for (RevenueByPeriodDTO period : stats.getRevenueByYear()) {
                yearTable.addCell(period.getPeriod());
                yearTable.addCell(formatCurrency(period.getRevenue()));
                yearTable.addCell(String.valueOf(period.getOrderCount()));
            }
            document.add(yearTable);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF file", e);
        }

        return outputStream;
    }

    @Override
    public ByteArrayOutputStream exportCustomersToPDF() {
        CustomerStatisticsDTO stats = statisticsService.getCustomerStatistics();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        try {
            Document document = createVietnamesePdfDocument(outputStream);

            // Title
            document.add(new Paragraph("BÁO CÁO THỐNG KÊ KHÁCH HÀNG")
                    .setFontSize(18).setBold());
            document.add(new Paragraph("Ngày xuất: " +
                    LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                    .setFontSize(10));
            document.add(new Paragraph("\n"));

            // Summary
            document.add(new Paragraph("Tổng quan").setFontSize(12).setBold());
            document.add(new Paragraph("Tổng khách hàng: " + stats.getTotalCustomers()));
            document.add(new Paragraph("Khách hàng hoạt động: " + stats.getActiveCustomers()));
            document.add(new Paragraph("Khách hàng mới (30 ngày): " + stats.getNewCustomers()));
            document.add(new Paragraph("\n"));

            // Top Customers by Purchase Count Table
            document.add(new Paragraph("Top 10 khách hàng có số lần mua nhiều nhất")
                    .setFontSize(12).setBold());
            Table purchaseCountTable = new Table(UnitValue.createPercentArray(new float[]{2, 2.5f, 1, 1.5f}));
            purchaseCountTable.addHeaderCell("Khách hàng");
            purchaseCountTable.addHeaderCell("Email");
            purchaseCountTable.addHeaderCell("Số lần mua");
            purchaseCountTable.addHeaderCell("Tổng chi tiêu");

            for (TopCustomerDTO customer : stats.getTopCustomersByPurchaseCount()) {
                String name = customer.getCustomerName();
                if (name != null && name.length() > 25) {
                    name = name.substring(0, 25) + "...";
                }
                String email = customer.getCustomerEmail();
                if (email != null && email.length() > 25) {
                    email = email.substring(0, 25) + "...";
                }
                purchaseCountTable.addCell(name != null ? name : "");
                purchaseCountTable.addCell(email != null ? email : "");
                purchaseCountTable.addCell(String.valueOf(customer.getPurchaseCount()));
                purchaseCountTable.addCell(formatCurrency(customer.getTotalSpending()));
            }
            document.add(purchaseCountTable);
            document.add(new Paragraph("\n"));

            // Top Customers by Spending Table
            document.add(new Paragraph("Top 10 khách hàng có tổng chi tiêu cao nhất")
                    .setFontSize(12).setBold());
            Table spendingTable = new Table(UnitValue.createPercentArray(new float[]{2, 2.5f, 1, 1.5f}));
            spendingTable.addHeaderCell("Khách hàng");
            spendingTable.addHeaderCell("Email");
            spendingTable.addHeaderCell("Số lần mua");
            spendingTable.addHeaderCell("Tổng chi tiêu");

            for (TopCustomerDTO customer : stats.getTopCustomersByTotalSpending()) {
                String name = customer.getCustomerName();
                if (name != null && name.length() > 25) {
                    name = name.substring(0, 25) + "...";
                }
                String email = customer.getCustomerEmail();
                if (email != null && email.length() > 25) {
                    email = email.substring(0, 25) + "...";
                }
                spendingTable.addCell(name != null ? name : "");
                spendingTable.addCell(email != null ? email : "");
                spendingTable.addCell(String.valueOf(customer.getPurchaseCount()));
                spendingTable.addCell(formatCurrency(customer.getTotalSpending()));
            }
            document.add(spendingTable);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF file", e);
        }

        return outputStream;
    }

    @Override
    public ByteArrayOutputStream exportAllStatisticsToPDF() {
        ProductStatisticsDTO productStats = statisticsService.getProductStatistics();
        RevenueStatisticsDTO revenueStats = statisticsService.getRevenueStatistics();
        CustomerStatisticsDTO customerStats = statisticsService.getCustomerStatistics();

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        try {
            Document document = createVietnamesePdfDocument(outputStream);

            // Title
            document.add(new Paragraph("BÁO CÁO THỐNG KÊ TỔNG HỢP")
                    .setFontSize(18).setBold());
            document.add(new Paragraph("Ngày xuất: " +
                    LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                    .setFontSize(10));
            document.add(new Paragraph("\n"));

            // ========== PRODUCTS SECTION ==========
            document.add(new Paragraph("THỐNG KÊ SẢN PHẨM").setFontSize(14).setBold());
            document.add(new Paragraph("Tổng sản phẩm: " + productStats.getTotalProducts()));
            document.add(new Paragraph("Tồn kho thấp: " + productStats.getLowStockProducts()));
            document.add(new Paragraph("Hết hàng: " + productStats.getOutOfStockProducts()));
            document.add(new Paragraph("\n"));

            // Best Selling Products Table
            document.add(new Paragraph("Top 10 sản phẩm bán chạy nhất").setFontSize(12).setBold());
            Table bestSellingTable = new Table(UnitValue.createPercentArray(new float[]{3, 1, 1.5f, 1, 1}));
            bestSellingTable.addHeaderCell("Sản phẩm");
            bestSellingTable.addHeaderCell("Số lượng");
            bestSellingTable.addHeaderCell("Doanh thu");
            bestSellingTable.addHeaderCell("Số lần mua");
            bestSellingTable.addHeaderCell("Tồn kho");

            for (TopProductDTO product : productStats.getBestSellingProducts()) {
                String name = product.getProductName();
                if (name != null && name.length() > 30) {
                    name = name.substring(0, 30) + "...";
                }
                bestSellingTable.addCell(name != null ? name : "");
                bestSellingTable.addCell(String.valueOf(product.getTotalQuantitySold()));
                bestSellingTable.addCell(formatCurrency(product.getTotalRevenue()));
                bestSellingTable.addCell(String.valueOf(product.getPurchaseCount()));
                bestSellingTable.addCell(String.valueOf(product.getCurrentStock()));
            }
            document.add(bestSellingTable);
            document.add(new Paragraph("\n"));

            // ========== REVENUE SECTION ==========
            document.add(new Paragraph("THỐNG KÊ DOANH THU").setFontSize(14).setBold());
            document.add(new Paragraph("Tổng doanh thu: " + formatCurrency(revenueStats.getTotalRevenue())));
            document.add(new Paragraph("Tổng đơn hàng: " + revenueStats.getTotalOrders()));
            document.add(new Paragraph("Giá trị đơn hàng trung bình: " +
                    formatCurrency(revenueStats.getAverageOrderValue())));
            document.add(new Paragraph("\n"));

            // Revenue by Month Table
            document.add(new Paragraph("Doanh thu theo tháng (12 tháng gần nhất)").setFontSize(12).setBold());
            Table monthTable = new Table(UnitValue.createPercentArray(new float[]{2, 2, 1}));
            monthTable.addHeaderCell("Tháng");
            monthTable.addHeaderCell("Doanh thu");
            monthTable.addHeaderCell("Số đơn hàng");

            int startIndex = Math.max(0, revenueStats.getRevenueByMonth().size() - 12);
            for (int i = startIndex; i < revenueStats.getRevenueByMonth().size(); i++) {
                RevenueByPeriodDTO period = revenueStats.getRevenueByMonth().get(i);
                monthTable.addCell(period.getPeriod());
                monthTable.addCell(formatCurrency(period.getRevenue()));
                monthTable.addCell(String.valueOf(period.getOrderCount()));
            }
            document.add(monthTable);
            document.add(new Paragraph("\n"));

            // ========== CUSTOMERS SECTION ==========
            document.add(new Paragraph("THỐNG KÊ KHÁCH HÀNG").setFontSize(14).setBold());
            document.add(new Paragraph("Tổng khách hàng: " + customerStats.getTotalCustomers()));
            document.add(new Paragraph("Khách hàng hoạt động: " + customerStats.getActiveCustomers()));
            document.add(new Paragraph("Khách hàng mới (30 ngày): " + customerStats.getNewCustomers()));
            document.add(new Paragraph("\n"));

            // Top Customers by Spending Table
            document.add(new Paragraph("Top 10 khách hàng có tổng chi tiêu cao nhất")
                    .setFontSize(12).setBold());
            Table spendingTable = new Table(UnitValue.createPercentArray(new float[]{2, 2.5f, 1, 1.5f}));
            spendingTable.addHeaderCell("Khách hàng");
            spendingTable.addHeaderCell("Email");
            spendingTable.addHeaderCell("Số lần mua");
            spendingTable.addHeaderCell("Tổng chi tiêu");

            for (TopCustomerDTO customer : customerStats.getTopCustomersByTotalSpending()) {
                String name = customer.getCustomerName();
                if (name != null && name.length() > 25) {
                    name = name.substring(0, 25) + "...";
                }
                String email = customer.getCustomerEmail();
                if (email != null && email.length() > 25) {
                    email = email.substring(0, 25) + "...";
                }
                spendingTable.addCell(name != null ? name : "");
                spendingTable.addCell(email != null ? email : "");
                spendingTable.addCell(String.valueOf(customer.getPurchaseCount()));
                spendingTable.addCell(formatCurrency(customer.getTotalSpending()));
            }
            document.add(spendingTable);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF file", e);
        }

        return outputStream;
    }
}
