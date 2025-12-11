package vn.iuh.dat.Service.Impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.iuh.dat.Entity.*;
import vn.iuh.dat.Repository.*;
import vn.iuh.dat.Service.IStatisticsService;
import vn.iuh.dat.dto.Response.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsServiceImpl implements IStatisticsService {

    private final OrderRepository orderRepo;
    private final OrderItemRepository orderItemRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final PaymentRepository paymentRepo;

    @Override
    public ProductStatisticsDTO getProductStatistics() {
        List<Order> allOrders = orderRepo.findAll();
        List<OrderItem> allOrderItems = orderItemRepo.findAll();
        List<Product> allProducts = productRepo.findAll();

        // Group order items by product
        Map<Long, List<OrderItem>> itemsByProduct = allOrderItems.stream()
                .collect(Collectors.groupingBy(item -> item.getProduct().getId()));

        // Calculate statistics for each product
        List<TopProductDTO> productStats = new ArrayList<>();
        for (Product product : allProducts) {
            List<OrderItem> items = itemsByProduct.getOrDefault(product.getId(), Collections.emptyList());
            
            long totalQuantitySold = items.stream().mapToLong(OrderItem::getQuantity).sum();
            double totalRevenue = items.stream().mapToDouble(OrderItem::getTotalPrice).sum();
            int purchaseCount = items.size();

            productStats.add(TopProductDTO.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .productImage(product.getImage())
                    .totalQuantitySold(totalQuantitySold)
                    .totalRevenue(totalRevenue)
                    .purchaseCount(purchaseCount)
                    .currentStock(product.getStock())
                    .build());
        }

        // Best selling products (by quantity)
        List<TopProductDTO> bestSelling = productStats.stream()
                .filter(p -> p.getTotalQuantitySold() > 0)
                .sorted((a, b) -> Long.compare(b.getTotalQuantitySold(), a.getTotalQuantitySold()))
                .limit(10)
                .collect(Collectors.toList());

        // Slow selling products (by quantity, but still sold)
        List<TopProductDTO> slowSelling = productStats.stream()
                .filter(p -> p.getTotalQuantitySold() > 0)
                .sorted(Comparator.comparingLong(TopProductDTO::getTotalQuantitySold))
                .limit(10)
                .collect(Collectors.toList());

        // Top products by purchase count
        List<TopProductDTO> topByPurchaseCount = productStats.stream()
                .filter(p -> p.getPurchaseCount() > 0)
                .sorted((a, b) -> Integer.compare(b.getPurchaseCount(), a.getPurchaseCount()))
                .limit(10)
                .collect(Collectors.toList());

        long totalProducts = allProducts.size();
        long lowStockProducts = allProducts.stream()
                .filter(p -> p.getStock() > 0 && p.getStock() < 10)
                .count();
        long outOfStockProducts = allProducts.stream()
                .filter(p -> p.getStock() == 0)
                .count();

        return ProductStatisticsDTO.builder()
                .bestSellingProducts(bestSelling)
                .slowSellingProducts(slowSelling)
                .topProductsByPurchaseCount(topByPurchaseCount)
                .totalProducts(totalProducts)
                .lowStockProducts(lowStockProducts)
                .outOfStockProducts(outOfStockProducts)
                .build();
    }

    @Override
    public RevenueStatisticsDTO getRevenueStatistics() {
        // Get paid order IDs directly from database to avoid lazy loading issues
        Set<Long> paidOrderIds = new HashSet<>(paymentRepo.findPaidOrderIds());
        
        // Get all orders and filter paid ones
        List<Order> allOrders = orderRepo.findAll();
        List<Order> paidOrders = allOrders.stream()
                .filter(order -> paidOrderIds.contains(order.getId()))
                .collect(Collectors.toList());

        double totalRevenue = paidOrders.stream()
                .mapToDouble(Order::getTotalAmount)
                .sum();
        
        long totalOrders = paidOrders.size();
        double averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0.0;

        // Revenue by month
        Map<String, RevenueByPeriodDTO> revenueByMonthMap = new TreeMap<>();
        for (Order order : paidOrders) {
            if (order.getCreatedAt() == null) continue;
            String monthKey = order.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM"));
            revenueByMonthMap.compute(monthKey, (k, v) -> {
                if (v == null) {
                    return RevenueByPeriodDTO.builder()
                            .period(k)
                            .revenue(order.getTotalAmount())
                            .orderCount(1L)
                            .build();
                }
                v.setRevenue(v.getRevenue() + order.getTotalAmount());
                v.setOrderCount(v.getOrderCount() + 1);
                return v;
            });
        }
        List<RevenueByPeriodDTO> revenueByMonth = new ArrayList<>(revenueByMonthMap.values());

        // Revenue by year
        Map<String, RevenueByPeriodDTO> revenueByYearMap = new TreeMap<>();
        for (Order order : paidOrders) {
            if (order.getCreatedAt() == null) continue;
            String yearKey = String.valueOf(order.getCreatedAt().getYear());
            revenueByYearMap.compute(yearKey, (k, v) -> {
                if (v == null) {
                    return RevenueByPeriodDTO.builder()
                            .period(k)
                            .revenue(order.getTotalAmount())
                            .orderCount(1L)
                            .build();
                }
                v.setRevenue(v.getRevenue() + order.getTotalAmount());
                v.setOrderCount(v.getOrderCount() + 1);
                return v;
            });
        }
        List<RevenueByPeriodDTO> revenueByYear = new ArrayList<>(revenueByYearMap.values());

        // Revenue by week (last 12 weeks)
        Map<String, RevenueByPeriodDTO> revenueByWeekMap = new TreeMap<>();
        LocalDateTime now = LocalDateTime.now();
        for (Order order : paidOrders) {
            if (order.getCreatedAt() == null) continue;
            LocalDateTime orderDate = order.getCreatedAt();
            long weeksAgo = java.time.temporal.ChronoUnit.WEEKS.between(orderDate, now);
            if (weeksAgo < 12) {
                String weekKey = String.format("%d-W%02d", orderDate.getYear(), 
                        (orderDate.getDayOfYear() / 7) + 1);
                revenueByWeekMap.compute(weekKey, (k, v) -> {
                    if (v == null) {
                        return RevenueByPeriodDTO.builder()
                                .period(k)
                                .revenue(order.getTotalAmount())
                                .orderCount(1L)
                                .build();
                    }
                    v.setRevenue(v.getRevenue() + order.getTotalAmount());
                    v.setOrderCount(v.getOrderCount() + 1);
                    return v;
                });
            }
        }
        List<RevenueByPeriodDTO> revenueByWeek = new ArrayList<>(revenueByWeekMap.values());

        // Revenue by day (last 30 days)
        Map<String, RevenueByPeriodDTO> revenueByDayMap = new TreeMap<>();
        for (Order order : paidOrders) {
            if (order.getCreatedAt() == null) continue;
            LocalDateTime orderDate = order.getCreatedAt();
            if (orderDate.isAfter(now.minusDays(30))) {
                String dayKey = orderDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                revenueByDayMap.compute(dayKey, (k, v) -> {
                    if (v == null) {
                        return RevenueByPeriodDTO.builder()
                                .period(k)
                                .revenue(order.getTotalAmount())
                                .orderCount(1L)
                                .build();
                    }
                    v.setRevenue(v.getRevenue() + order.getTotalAmount());
                    v.setOrderCount(v.getOrderCount() + 1);
                    return v;
                });
            }
        }
        List<RevenueByPeriodDTO> revenueByDay = new ArrayList<>(revenueByDayMap.values());

        return RevenueStatisticsDTO.builder()
                .totalRevenue(totalRevenue)
                .averageOrderValue(averageOrderValue)
                .totalOrders(totalOrders)
                .revenueByMonth(revenueByMonth)
                .revenueByWeek(revenueByWeek)
                .revenueByYear(revenueByYear)
                .revenueByDay(revenueByDay)
                .build();
    }

    @Override
    public CustomerStatisticsDTO getCustomerStatistics() {
        Optional<Role> customerRole = roleRepo.findByName("CUSTOMER");
        if (customerRole.isEmpty()) {
            return CustomerStatisticsDTO.builder()
                    .totalCustomers(0L)
                    .activeCustomers(0L)
                    .newCustomers(0L)
                    .topCustomersByPurchaseCount(Collections.emptyList())
                    .topCustomersByTotalSpending(Collections.emptyList())
                    .build();
        }

        List<User> allCustomers = userRepo.findAll().stream()
                .filter(user -> customerRole.get().getId().equals(user.getRole().getId()))
                .collect(Collectors.toList());

        List<Order> allOrders = orderRepo.findAll();
        
        // Get paid order IDs directly from database to avoid lazy loading issues
        Set<Long> paidOrderIds = new HashSet<>(paymentRepo.findPaidOrderIds());
        
        // Group orders by customer
        Map<Long, List<Order>> ordersByCustomer = allOrders.stream()
                .filter(order -> order.getCustomer() != null)
                .collect(Collectors.groupingBy(order -> order.getCustomer().getId()));

        // Calculate customer statistics
        List<TopCustomerDTO> customerStats = new ArrayList<>();
        for (User customer : allCustomers) {
            List<Order> customerOrders = ordersByCustomer.getOrDefault(customer.getId(), Collections.emptyList());
            
            long purchaseCount = customerOrders.size();
            double totalSpending = customerOrders.stream()
                    .filter(order -> paidOrderIds.contains(order.getId()))
                    .mapToDouble(Order::getTotalAmount)
                    .sum();

            customerStats.add(TopCustomerDTO.builder()
                    .customerId(customer.getId())
                    .customerName(customer.getFullName())
                    .customerEmail(customer.getEmail())
                    .purchaseCount(purchaseCount)
                    .totalSpending(totalSpending)
                    .build());
        }

        // Top customers by purchase count
        List<TopCustomerDTO> topByPurchaseCount = customerStats.stream()
                .filter(c -> c.getPurchaseCount() > 0)
                .sorted((a, b) -> Long.compare(b.getPurchaseCount(), a.getPurchaseCount()))
                .limit(10)
                .collect(Collectors.toList());

        // Top customers by total spending
        List<TopCustomerDTO> topBySpending = customerStats.stream()
                .filter(c -> c.getTotalSpending() > 0)
                .sorted((a, b) -> Double.compare(b.getTotalSpending(), a.getTotalSpending()))
                .limit(10)
                .collect(Collectors.toList());

        long totalCustomers = allCustomers.size();
        long activeCustomers = customerStats.stream()
                .filter(c -> c.getPurchaseCount() > 0)
                .count();
        
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        long newCustomers = allCustomers.stream()
                .filter(customer -> {
                    if (customer.getCreatedAt() == null) return false;
                    return customer.getCreatedAt().isAfter(thirtyDaysAgo);
                })
                .count();

        return CustomerStatisticsDTO.builder()
                .totalCustomers(totalCustomers)
                .activeCustomers(activeCustomers)
                .newCustomers(newCustomers)
                .topCustomersByPurchaseCount(topByPurchaseCount)
                .topCustomersByTotalSpending(topBySpending)
                .build();
    }
}

