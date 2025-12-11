package vn.iuh.dat.Configuration;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import vn.iuh.dat.Entity.Role;
import vn.iuh.dat.Entity.User;
import vn.iuh.dat.Repository.RoleRepository;
import vn.iuh.dat.Repository.UserRepository;

import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class ApplicationInitConfig {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public ApplicationRunner initApp() {
        return args -> {

            // =======================
            // 1. Tạo role nếu chưa có
            // =======================
            if (roleRepository.findByName("ADMIN").isEmpty()) {
                Role adminRole = Role.builder()
                        .name("ADMIN")
                        .description("Quản trị viên - Toàn quyền quản lý hệ thống")
                        .build();
                roleRepository.save(adminRole);
                log.info("Created default role: ADMIN");
            }

            if (roleRepository.findByName("CUSTOMER").isEmpty()) {
                Role customerRole = Role.builder()
                        .name("CUSTOMER")
                        .description("Khách hàng - Người dùng mua sắm")
                        .build();
                roleRepository.save(customerRole);
                log.info("Created default role: CUSTOMER");
            }

            // =======================
            // 2. Tạo admin mặc định
            // =======================
            if (userRepository.findByEmail("admin@gmail.com").isEmpty()) {
                Role adminRole = roleRepository.findByName("ADMIN").orElseThrow();
                Role cusRole = roleRepository.findByName("CUSTOMER").orElseThrow();
                User admin = User.builder()
                        .email("admin@gmail.com")
                        .password(passwordEncoder.encode("Admin12345"))
                        .fullName("Dat Le")
                        .address("226 nguyễn văn lượng, phường 17, tp HCM")
                        .phone("0123456789")
                        .role(adminRole)
                        .enabled(true)
                        .createdAt(LocalDateTime.now())
                        .build();
                User cus = User.builder()
                                .email("levandat@gmail.com")
                                .password(passwordEncoder.encode("Levandat12345"))
                                .fullName("Le Van Dat")
                                .address("12 Nguyễn Văn Bảo, Phường 12, TP HCM")
                                .phone("0123456789")
                                .role(cusRole)
                                .enabled(true)
                                .createdAt(LocalDateTime.now())
                                        .build();
                userRepository.save(admin);
                userRepository.save(cus);

                log.warn("Default admin created! Email: admin@gmail.com | Password: admin12345");
                log.warn("Default customer created! Email: customer1@gmail.com | Password: customer1");
            }
        };
    }
}
