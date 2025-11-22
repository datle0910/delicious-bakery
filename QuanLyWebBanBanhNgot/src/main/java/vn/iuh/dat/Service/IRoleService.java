package vn.iuh.dat.Service;

import vn.iuh.dat.dto.Response.RoleDTO;
import java.util.List;

public interface IRoleService {
    List<RoleDTO> findAll();
    RoleDTO findById(Long id);
    RoleDTO save(RoleDTO dto);
    void deleteById(Long id);
}
