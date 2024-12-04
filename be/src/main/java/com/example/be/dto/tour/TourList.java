package com.example.be.dto.tour;

import lombok.Data;

import java.time.LocalDate;

@Data
public class TourList {
  private Integer id;
  private String image;
  private String src;
  private String title;
  private String location;
  private String product;
  private Integer price;

  //cartList 에서 사용
  private LocalDate startDate;
  private LocalDate endDate;
}
