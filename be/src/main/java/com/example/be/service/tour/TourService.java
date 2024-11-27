package com.example.be.service.tour;

import com.example.be.dto.tour.Tour;
import com.example.be.mapper.tour.TourMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class TourService {
  final TourMapper mapper;

  public boolean add(Tour tour, Authentication authentication) {
    String nickname = mapper.findNickname(authentication.getName());
    tour.setPartner(nickname);

//    //TODO: 파일 업로드 기능 AWS?
//    if (files != null && files.length > 0) {
//      //폴더 생성
//      String directory = "C:/Temp/team1126/" + tour.getId() + "}";
//      File dir = new File(directory);
//      if (!dir.exists()) {
//        dir.mkdirs();
//      }
//    }
//
//    for (MultipartFile file : files) {
//      String filePath = "C:/Temp/team1126/" + tour.getId() + "{file.getOriginalFilename()}";
//      try {
//        file.transferTo(new File(filePath));
//      } catch (IOException e) {
//        throw new RuntimeException(e);
//      }
//    }

    int cnt = mapper.insert(tour);
    return cnt == 1;
  }

  public List<Tour> list() {
    return mapper.selectAll();
  }

  public Tour get(int id) {
    return mapper.selectById(id);
  }

  public boolean validate(Tour tour) {
    boolean title = tour.getTitle().trim().length() > 0;
    boolean product = tour.getProduct().trim().length() > 0;
    boolean priceValid = false;
    try {
      // price가 null이 아니면서 0보다 크거나 같은지 확인
      if (tour.getPrice() != null) {
        priceValid = tour.getPrice() >= 0;
      }
    } catch (Exception e) {
      priceValid = false; // 예외 발생 시 유효하지 않은 가격으로 처리
    }
    return title && product && priceValid;
  }

  public boolean delete(int id) {
    int cnt = mapper.deleteById(id);
    return cnt == 1;
  }

  public boolean update(Tour tour) {
    int cnt = mapper.update(tour);
    return cnt == 1;
  }
}
