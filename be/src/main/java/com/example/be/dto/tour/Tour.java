package com.example.be.dto.tour;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class Tour {
    private Integer id;
    private String title;
    private String product;
    private Integer price;
    private String content;
    private String writer;
    private LocalDateTime inserted;
    private List<String> fileSrc;
}
