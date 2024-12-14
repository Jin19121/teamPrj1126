package com.example.be.service.community;

import com.example.be.dto.community.Community;
import com.example.be.dto.community.CommunityComment;
import com.example.be.mapper.community.CommunityMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommunityService {

    final CommunityMapper mapper;
    final S3Client s3;


    @Value("${image.src.prefix}")
    String imageSrcPrefix;

    @Value("${bucket.name}")
    String bucketName;


    public List<Map<String, Object>> wholeList(String email) {
        return mapper.wholeListUp(email);
    }

    public Map<String, Object> list(Integer page, String searchType, String searchKeyword) {

        Integer pageList = (page - 1) * 10;

//        모든 수를 세는 것을 만들어야 함

        List<Community> list = mapper.listUp(pageList, searchType, searchKeyword);
        for (Community community : list) {
            Integer countFiles = mapper.countFilesByCommunityId(community.getId());
            if (countFiles > 0) {
                community.setExistOfFiles(true);
            } else {
                community.setExistOfFiles(false);
            }
            Integer countComments = mapper.countCommentsByCommunityId(community.getId());
            if (countComments != null) {
                community.setNumberOfComments(countComments + "");
            }
            Integer countLikes = mapper.countLikesByCommunityId(community.getId());
            if (countLikes != null) {
                community.setNumberOfLikes(countLikes);
            } else {
                community.setNumberOfLikes(0);
            }
        }

        Integer countCommunity = mapper.countAllCommunity(searchType, searchKeyword);
        System.out.println(countCommunity);

        return Map.of("list", list, "countCommunity", countCommunity);
    }

    public void write(Community community, MultipartFile[] files, Authentication auth) {
        String nickname = mapper.findNickname(auth.getName());
        community.setWriter(nickname);
        mapper.writeCommunity(community);
        Integer id = community.getId();

        if (files != null && files.length > 0) {

            for (MultipartFile file : files) {
                String fileName = file.getOriginalFilename();
                String objectKey = STR."teamPrj1126/community/\{id}/\{fileName}";
                PutObjectRequest por = PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(objectKey)
                        .acl(ObjectCannedACL.PUBLIC_READ)
                        .build();
                try {
                    s3.putObject(por, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
                } catch (IOException e) {
                    throw new RuntimeException(e.getMessage(), e);
                }
                mapper.addFile(fileName, id);
            }
        }
    }

    public Map<String, Object> view(Integer id) {


        Map<String, Object> viewer = mapper.viewCommunity(id);
        Integer countLike = mapper.countLikesByCommunityId(id);
        viewer.put("like", countLike);
        // 게시글 좋아요 수 추가

        List<Integer> fileList = mapper.callCommunityFile(id);
        List<Map<String, Object>> commentList = mapper.callCommunityComment(id);
        viewer.put("commentList", commentList);
        if (fileList.size() != 0) {
            List<Object> files = new ArrayList();
            for (Integer fileNumber : fileList) {
                Map<String, Object> file = new HashMap<>();
                String fileName = mapper.findFileNameByFileNumber(fileNumber);
                String filePath = STR."\{imageSrcPrefix}/community/\{viewer.get("id").toString()}/\{fileName}";
                file.put("id", fileNumber);
                file.put("fileName", fileName);
                file.put("filePath", filePath);
                files.add(file);
            }
            viewer.put("files", files);
            return viewer;
        } else {
            return viewer;
        }
    }

    public void edit(Community community, List<Integer> removeFiles, MultipartFile[] uploadFiles, Authentication auth) {
        mapper.editCommunity(community);
        Integer id = community.getId();

        for (Integer fileNumber : removeFiles) {
            String fileName = mapper.findFileNameByFileNumber(fileNumber);
            String key = STR."teamPrj1126/community/\{id}/\{fileName}";
            DeleteObjectRequest dor = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();
            s3.deleteObject(dor);
            mapper.deleteFileByFileNumber(fileNumber);
        }

        if (uploadFiles != null && uploadFiles.length > 0) {

            for (MultipartFile file : uploadFiles) {
                String fileName = file.getOriginalFilename();
                String objectKey = STR."teamPrj1126/community/\{id}/\{fileName}";
                PutObjectRequest por = PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(objectKey)
                        .acl(ObjectCannedACL.PUBLIC_READ)
                        .build();
                try {
                    s3.putObject(por, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
                } catch (IOException e) {
                    throw new RuntimeException(e.getMessage(), e);
                }
                mapper.addFile(fileName, id);
            }
        }
    }

    public void delete(Integer id, Authentication auth) {

        List<String> fileName = mapper.selectFilesByCommunityId(id);

        for (String file : fileName) {
            String key = STR."teamPrj1126/community/\{id}/\{file}";
            DeleteObjectRequest dor = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();
            s3.deleteObject(dor);
        }

        mapper.deleteFileByCommunityId(id);

        // 댓글 지우기
        mapper.deleteCommentByCommunityId(id);
        // 좋아요 지우기
        mapper.deleteLikeByCommunityId(id);

        mapper.deleteCommunity(id);
    }

    public void commentWrite(CommunityComment communityComment, Authentication auth) {
        String nickname = mapper.findNickname(auth.getName());
        communityComment.setWriter(nickname);

        System.out.println(communityComment);
//        TODO : communityId 값 삽입 -> 나중에 jsx 에서 전송하는 것으로 하기.


        mapper.writeCommunityComment(communityComment);
    }

    public void commentDelete(Integer id, Authentication auth) {
        mapper.deleteCommentByCommentId(id);
    }

    public void updateComment(CommunityComment communityComment, Integer id, Authentication auth) {
        String comment = communityComment.getComment();
        System.out.println(comment);
//        TODO : 권한이 있을 경우 수정 가능, 권한이 없을 경우 toaster 로 수정 불가
        mapper.updateCommunityComment(comment, id);
    }

}
