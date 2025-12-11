package vn.iuh.dat.Service;

import vn.iuh.dat.dto.Request.ProfileUpdateDTO;
import vn.iuh.dat.dto.Request.RegisterWithOtpDTO;
import vn.iuh.dat.dto.Request.UserRequestDTO;
import vn.iuh.dat.dto.Response.UserResponseDTO;

import java.util.List;

public interface IUserService {
    List<UserResponseDTO> findAll();
    UserResponseDTO findById(Long id);
    UserResponseDTO create(UserRequestDTO dto);
    UserResponseDTO registerWithOtp(RegisterWithOtpDTO dto);
    UserResponseDTO update(Long id, UserRequestDTO dto);
    UserResponseDTO updateProfile(Long id, ProfileUpdateDTO dto);
    void deleteById(Long id);
    boolean existsByEmail(String email);
    UserResponseDTO findByEmail(String email);
}
