package vn.iuh.dat.Service.Impl;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import vn.iuh.dat.Entity.Review;
import vn.iuh.dat.Entity.Role;
import vn.iuh.dat.Repository.RoleRepository;
import vn.iuh.dat.Service.IRoleService;
import vn.iuh.dat.dto.Response.ReviewDTO;
import vn.iuh.dat.dto.Response.RoleDTO;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements IRoleService {
    private final RoleRepository repo;
    private ModelMapper mapper = new ModelMapper();

    @Override
    public List<RoleDTO> findAll() {
        return repo.findAll().stream()
                .map(r -> RoleDTO.builder()
                        .id(r.getId())
                        .name(r.getName())
                        .description(r.getDescription())
                        .build())
                .toList();
    }

    @Override
    public RoleDTO findById(Long id) {
        return repo.findById(id)
                .map(r -> RoleDTO.builder()
                        .id(r.getId())
                        .name(r.getName())
                        .description(r.getDescription())
                        .build())
                .orElse(null);
    }

    @Override
    public RoleDTO save(RoleDTO dto) {
        if (dto.getId() != null) {
            // Update existing role - only update description, keep name unchanged
            Role existingRole = repo.findById(dto.getId())
                    .orElseThrow(() -> new RuntimeException("Role not found"));
            existingRole.setDescription(dto.getDescription());
            // Name is not updated - it remains unchanged
            Role saved = repo.save(existingRole);
            return RoleDTO.builder()
                    .id(saved.getId())
                    .name(saved.getName())
                    .description(saved.getDescription())
                    .build();
        } else {
            // Create new role
            Role role = Role.builder()
                    .name(dto.getName())
                    .description(dto.getDescription())
                    .build();
            Role saved = repo.save(role);
            return RoleDTO.builder()
                    .id(saved.getId())
                    .name(saved.getName())
                    .description(saved.getDescription())
                    .build();
        }
    }

    @Override
    public void deleteById(Long id) {
        repo.deleteById(id);
    }
    private RoleDTO toDTO(Role role) {
        RoleDTO dto = mapper.map(role, RoleDTO.class);
        return dto;
    }
    private ReviewDTO toDTO(Review review) {
        ReviewDTO dto = mapper.map(review, ReviewDTO.class);
        return dto;
    }
}
