package vn.iuh.dat.Service.Impl;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.iuh.dat.Entity.Role;
import vn.iuh.dat.Entity.User;
import vn.iuh.dat.Repository.RoleRepository;
import vn.iuh.dat.Repository.UserRepository;
import vn.iuh.dat.Service.IUserService;
import vn.iuh.dat.Service.OtpService;
import vn.iuh.dat.Service.EmailService;
import vn.iuh.dat.dto.Request.ProfileUpdateDTO;
import vn.iuh.dat.dto.Request.RegisterWithOtpDTO;
import vn.iuh.dat.dto.Request.UserRequestDTO;
import vn.iuh.dat.dto.Response.UserResponseDTO;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {
    private final UserRepository repo;
    private final RoleRepository roleRepo;
    private final ModelMapper mapper = new ModelMapper();
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final EmailService emailService;

    @Override
    public List<UserResponseDTO> findAll() {
        return repo.findAll().stream().map(this::toDTO).toList();
    }

    @Override
    public UserResponseDTO findById(Long id) {
        return repo.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("User not found"));

    }


    @Override
    public UserResponseDTO create(UserRequestDTO dto) {
        if (repo.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already exists!");
        }

        Role role = roleRepo.findById(dto.getRoleId()).orElseThrow(() -> new RuntimeException("Default role USER not found!"));

        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setFullName(dto.getFullName());
        user.setPhone(dto.getPhone());
        user.setAddress(dto.getAddress());
        user.setEnabled(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setRole(role);

        repo.save(user);
        // Send welcome email
        try {
            emailService.sendWelcomeEmail(user);
        } catch (Exception ignored) {
        }
        return toDTO(user);
    }

    @Override
    public UserResponseDTO registerWithOtp(RegisterWithOtpDTO dto) {
        // Verify OTP first
        boolean otpValid = otpService.verifyOtp(dto.getEmail(), dto.getOtp());
        if (!otpValid) {
            throw new RuntimeException("Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.");
        }

        // Check if email already exists
        if (repo.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email này đã được sử dụng. Vui lòng chọn email khác.");
        }

        // Get role (default to CUSTOMER if not specified)
        Long roleId = dto.getRoleId() != null ? dto.getRoleId() : 2L; // 2 = CUSTOMER
        Role role = roleRepo.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found!"));

        // Create user
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setFullName(dto.getFullName());
        user.setPhone(dto.getPhone());
        user.setAddress(dto.getAddress());
        user.setEnabled(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setRole(role);

        repo.save(user);
        return toDTO(user);
    }


    @Override
    public UserResponseDTO update(Long id, UserRequestDTO dto){
        User user = repo.findById(id).orElseThrow(() -> new RuntimeException("User not found!"));

        if (!user.getEmail().equals(dto.getEmail()) && repo.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already exists!");
        }

        user.setEmail(dto.getEmail());
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            // Use the shared PasswordEncoder bean (BCrypt with strength 10 from SecurityConfig)
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        user.setFullName(dto.getFullName());
        user.setPhone(dto.getPhone());
        user.setAddress(dto.getAddress());

        // Update enabled status if provided
        if (dto.getEnabled() != null) {
            // Prevent disabling admin accounts
            if (user.getRole() != null && "ADMIN".equals(user.getRole().getName()) && !dto.getEnabled()) {
                throw new RuntimeException("Không thể vô hiệu hóa tài khoản quản trị viên!");
            }
            user.setEnabled(dto.getEnabled());
        }

        // Update role if provided
        if (dto.getRoleId() != null) {
            Role role = roleRepo.findById(dto.getRoleId())
                    .orElseThrow(() -> new RuntimeException("Role not found!"));
            user.setRole(role);
        }

        repo.save(user);
        return toDTO(user);
    }


    @Override
    public UserResponseDTO updateProfile(Long id, ProfileUpdateDTO dto) {
        User user = repo.findById(id).orElseThrow(() -> new RuntimeException("User not found!"));

        user.setFullName(dto.getFullName());
        if (dto.getPhone() != null) {
            String phone = dto.getPhone().isBlank() ? null : dto.getPhone();
            user.setPhone(phone);
        }
        if (dto.getAddress() != null) {
            String address = dto.getAddress().isBlank() ? null : dto.getAddress();
            user.setAddress(address);
        }

        repo.save(user);
        return toDTO(user);
    }

    @Override
    public void deleteById(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        repo.deleteById(id);
    }

    @Override
    public boolean existsByEmail(String email) {
        return repo.existsByEmail(email);
    }

    @Override
    public UserResponseDTO findByEmail(String email) {
        return repo.findByEmail(email)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private UserResponseDTO toDTO(User u) {
        UserResponseDTO dto = mapper.map(u, UserResponseDTO.class);
        // Explicitly set roleName from the Role entity
        if (u.getRole() != null) {
            dto.setRoleName(u.getRole().getName());
        }
        return dto;
    }
    private User toEntity(UserRequestDTO dto) {
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword()); // nhớ hash sau này
        user.setFullName(dto.getFullName());
        user.setPhone(dto.getPhone());
        user.setAddress(dto.getAddress());
        user.setEnabled(true);
        user.setCreatedAt(LocalDateTime.now());

        // Load role từ DB (cực kỳ quan trọng)
        Role role = roleRepo.findById(dto.getRoleId())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        user.setRole(role);
        return user;
    }

}
