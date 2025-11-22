package vn.iuh.dat.Service;

import vn.iuh.dat.dto.Request.UserRequestDTO;
import vn.iuh.dat.dto.Response.UserResponseDTO;

import java.util.List;

public interface IUserService {
    List<UserResponseDTO> findAll();
    UserResponseDTO findById(Long id);
    UserResponseDTO create(UserRequestDTO dto);
    UserResponseDTO update(Long id, UserRequestDTO dto);
    void deleteById(Long id);
    boolean existsByEmail(String email);
    UserResponseDTO findByEmail(String email);
}
