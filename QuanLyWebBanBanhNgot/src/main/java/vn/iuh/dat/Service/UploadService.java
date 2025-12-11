package vn.iuh.dat.Service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class UploadService {

    private final Cloudinary cloudinary;

    public String upload(MultipartFile file) {
        try {
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "delicious-bakery" // tạo folder Cloudinary
                    )
            );

            return uploadResult.get("secure_url").toString(); // link ảnh
        } catch (Exception e) {
            throw new RuntimeException("Upload image failed: " + e.getMessage());
        }
    }
}

