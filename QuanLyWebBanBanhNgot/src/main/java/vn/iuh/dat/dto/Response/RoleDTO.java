package vn.iuh.dat.dto.Response;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleDTO {
    private Long id;
    private String name;
    private String description;
}
