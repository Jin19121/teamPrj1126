package com.example.be.controller.member;

import com.example.be.dto.member.KakaoInfo;
import com.example.be.dto.member.Member;
import com.example.be.service.member.KakaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/member")
public class KakaoController {
  private final KakaoService kakaoService;

  @PostMapping("/signup/kakao")
  public ResponseEntity<Map<String, Object>> signup(
          Member member, String kakaoImageSrc,
          @RequestParam(value = "files[]", required = false) MultipartFile[] files) throws IOException {
    System.out.println("가입 정보:" + member);
    System.out.println("파일" + files);
    System.out.println("kakao" + kakaoImageSrc);

    //새 프로필을 설정하지 않았다면 카카오 프로필=>multipart 변환해서 넘김
    if (files == null) {
      files = kakaoService.convertUrlToMultipartFile(kakaoImageSrc);
    }

    System.out.println("카카오 변환 파일:" + files);

    if (kakaoService.add(member, files)) {
      return ResponseEntity.ok().body(Map.of("message",
              Map.of("type", "success", "text", "회원 가입 완료")));
    } else {
      return ResponseEntity.internalServerError().body(Map.of("message",
              Map.of("type", "error", "text", "회원 가입 중 문제가 발생하였습니다.")));
    }
  }

  @PostMapping("/login/kakao")
  public ResponseEntity<Map<String, Object>> kakaoLogin(@RequestBody KakaoInfo request) {
//    System.out.println("받은 정보:" + request);

    //토큰 생성해옴
    String token = kakaoService.token(request);

    if (token != null) {
      //토큰 있으면 토큰 반환
      return ResponseEntity.ok(Map.of("token", token));
    } else {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
  }
}
