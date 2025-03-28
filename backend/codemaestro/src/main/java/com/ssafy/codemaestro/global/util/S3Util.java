package com.ssafy.codemaestro.global.util;

import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.ObjectMetadata;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Util {

    private final AmazonS3Client amazonS3Client;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    /**
     *
     * @param file
     * @return 이미지 URL
     */
    public String uploadFile(MultipartFile file) {
        try {
            String fileName = createFileName(file.getOriginalFilename());
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType(file.getContentType());
            metadata.setContentLength(file.getSize());

            amazonS3Client.putObject(bucket, fileName, file.getInputStream(), metadata);
            return amazonS3Client.getUrl(bucket, fileName).toString();
        } catch (IOException e) {
            throw new RuntimeException("파일 업로드 실패");
        }
    }

    /**
     * fileUrl에 해당하는 파일을 S3에서 삭제합니다.
     * @param fileUrl
     */
    public void deleteFile(String fileUrl) {
        System.out.println("################### fileUrl: " + fileUrl);
        if (fileUrl == null || fileUrl.isEmpty()) return;

        try {
            String fileName = extractFileNameFromUrl(fileUrl);
            if (amazonS3Client.doesObjectExist(bucket, fileName)) { // 파일 존재하면
                amazonS3Client.deleteObject(bucket, fileName); // 삭제
            }
        } catch (Exception e) {
            throw new RuntimeException("파일 삭제 실패: " + e.getMessage());
        }
    }

    // 파일명 중복방지(UUID)
    private String createFileName(String originalFilename) {
        return UUID.randomUUID().toString() + "_" + originalFilename;
    }

    // S3 URL에서 파일명 추출
    private String extractFileNameFromUrl(String fileUrl) {
        return fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
    }
}
