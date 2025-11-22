package vn.iuh.dat.Service.Impl;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.iuh.dat.Entity.Role;
import vn.iuh.dat.Entity.User;
import vn.iuh.dat.Repository.RoleRepository;
import vn.iuh.dat.Repository.UserRepository;
import vn.iuh.dat.Service.IUserService;
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
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
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
            PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        user.setFullName(dto.getFullName());
        user.setPhone(dto.getPhone());
        user.setAddress(dto.getAddress());

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
