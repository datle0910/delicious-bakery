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
                .map(r -> new RoleDTO(r.getId(), r.getName()))
                .toList();
    }

    @Override
    public RoleDTO findById(Long id) {
        return repo.findById(id)
                .map(r -> new RoleDTO(r.getId(), r.getName()))
                .orElse(null);
    }

    @Override
    public RoleDTO save(RoleDTO dto) {
        Role role = new Role(dto.getId(), dto.getName());
        return new RoleDTO(repo.save(role).getId(), role.getName());
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
