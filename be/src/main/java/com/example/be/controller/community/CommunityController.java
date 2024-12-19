package com.example.be.controller.community;

import com.example.be.dto.community.Community;
import com.example.be.dto.community.CommunityComment;
import com.example.be.service.community.CommunityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/community")
@RequiredArgsConstructor
public class CommunityController {

    final CommunityService service;

    @GetMapping("list")
    public Map<String, Object> list(@RequestParam(value = "page", defaultValue = "1") Integer page,
                                    @RequestParam(value = "type", defaultValue = "all") String searchType,
                                    @RequestParam(value = "keyword", defaultValue = "") String searchKeyword) {
        return service.list(page, searchType, searchKeyword);
    }

    @GetMapping("wholeList/{email}")
    @PreAuthorize("isAuthenticated()")
    public List<Map<String, Object>> wholeList(@PathVariable String email) {
        return service.wholeList(email);
    }


    @PostMapping("write")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> write(Community community, @RequestParam(value = "files[]", required = false) MultipartFile[] files, Authentication auth) {
        try {
            if (service.checkMember(auth)) {
                if (service.checkCommunity(community)) {
                    service.write(community, files, auth);
                    return ResponseEntity.ok().body(Map.of("message", Map.of("type", "success",
                            "text", STR."\{community.getId()}번 게시물이 등록되었습니다"), "id", community.getId()));
                } else {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", Map.of("type", "error",
                                    "text", "제목이나 본문이 비어있을 수 없습니다.")));
                }
            } else {
                return ResponseEntity.status(403)
                        .body(Map.of("message", Map.of("type", "warning",
                                "text", "작성 권한이 없습니다.")));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", Map.of("type", "warning",
                            "text", "작성에 실패했습니다.")));
        }
    }

    @GetMapping("view/{id}")
    public Map<String, Object> view(@PathVariable Integer id, Authentication auth) {
        return service.view(id, auth);
    }

    @PutMapping("edit")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> edit(Community community,
                                                    @RequestParam(defaultValue = "0", value = "removeFiles[]", required = false) List<Integer> removeFiles,
                                                    @RequestParam(value = "uploadFiles[]", required = false) MultipartFile[] uploadFiles,
                                                    Authentication auth) {
        Integer id = community.getId();
        try {
            if (service.checkRightsOfAccess(id, auth)) {
                if (service.checkCommunity(community)) {
                    service.edit(community, removeFiles, uploadFiles);
                    return ResponseEntity.ok()
                            .body(Map.of("message", Map.of("type", "success",
                                    "text", STR."\{community.getId()}번 게시물이 수정되었습니다"), "id", community.getId()));
                } else {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", Map.of("type", "error",
                                    "text", "제목이나 본문이 비어있을 수 없습니다.")));
                }
            } else {
                return ResponseEntity.status(403)
                        .body(Map.of("message", Map.of("type", "warning",
                                "text", "수정 권한이 없습니다.")));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", Map.of("type", "warning",
                            "text", "수정에 실패했습니다.")));
        }
    }

    @DeleteMapping("delete/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Integer id, Authentication auth) {
        try {
            if (service.checkRightsOfAccess(id, auth)) {
                service.delete(id, auth);
                return ResponseEntity.ok()
                        .body(Map.of("message", Map.of("type", "success",
                                "text", "게시물이 삭제되었습니다")));
            } else if (service.checkAdmin(auth)) {
                service.delete(id, auth);
                return ResponseEntity.ok()
                        .body(Map.of("message", Map.of("type", "success",
                                "text", "게시물이 삭제되었습니다")));
            } else {
                return ResponseEntity.status(403)
                        .body(Map.of("message", Map.of("type", "warning",
                                "text", "삭제 권한이 없습니다.")));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", Map.of("type", "error",
                            "text", "존재하지 않는 게시물입니다.")));
        }
    }

//    TODO :  게시판 댓글 기능

    @PostMapping("comment/write")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> commentWrite(@RequestBody CommunityComment communityComment, Authentication auth) {
        try {
            if (service.checkMember(auth)) {
                if (service.checkComment(communityComment)) {
                    service.commentWrite(communityComment, auth);
                    return ResponseEntity.ok()
                            .body(Map.of("message", Map.of("type", "success",
                                    "text", "댓글이 등록되었습니다")));
                } else {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", Map.of("type", "error",
                                    "text", "댓글 내용이 비어있을 수 없습니다.")));
                }
            } else {
                return ResponseEntity.status(403)
                        .body(Map.of("message", Map.of("type", "warning",
                                "text", "작성 권한이 없습니다.")));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", Map.of("type", "warning",
                            "text", "작성에 실패했습니다.")));
        }
    }

    @DeleteMapping("comment/delete/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> commentDelete(@PathVariable Integer id, Authentication auth) {
        try {
            if (service.checkCommentRightsOfAccess(id, auth)) {
                service.commentDelete(id);
                return ResponseEntity.ok()
                        .body(Map.of("message", Map.of("type", "success",
                                "text", "댓글이 삭제되었습니다")));
            } else if (service.checkAdmin(auth)) {
                service.commentDelete(id);
                return ResponseEntity.ok()
                        .body(Map.of("message", Map.of("type", "success",
                                "text", "댓글이 삭제되었습니다")));
            } else {
                return ResponseEntity.status(403)
                        .body(Map.of("message", Map.of("type", "warning",
                                "text", "삭제 권한이 없습니다.")));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", Map.of("type", "error",
                            "text", "존재하지 않는 댓글입니다.")));
        }
    }

    @PutMapping("comment/edit/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> commentEdit(@RequestBody CommunityComment communityComment, @PathVariable Integer id, Authentication auth) {
        try {
            if (service.checkCommentRightsOfAccess(id, auth)) {
                if (service.checkComment(communityComment)) {
                    service.updateComment(communityComment, id, auth);
                    return ResponseEntity.ok()
                            .body(Map.of("message", Map.of("type", "success",
                                    "text", "댓글이 수정되었습니다")));
                } else {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", Map.of("type", "error",
                                    "text", "댓글 내용이 비어있을 수 없습니다.")));
                }
            } else {
                return ResponseEntity.status(403)
                        .body(Map.of("message", Map.of("type", "warning",
                                "text", "수정 권한이 없습니다.")));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", Map.of("type", "warning",
                            "text", "수정에 실패했습니다.")));
        }
    }

    @PostMapping("like/{id}")
    @PreAuthorize("isAuthenticated()")
    public void like(@PathVariable Integer id, Authentication auth) {
        if (service.checkMember(auth)) {
            if (service.checkLikeInCommunity(id, auth)) {
                service.removeLikeInCommunity(id, auth);
            } else {
                service.addLikeInCommunity(id, auth);
            }
        }
    }

    @GetMapping("fetch/{id}")
    public Map<String, Object> fetch(@PathVariable Integer id, Authentication auth) {

        Map<String, Object> viewer = service.fetchCommunity(id, auth);

        return viewer;
    }

}
