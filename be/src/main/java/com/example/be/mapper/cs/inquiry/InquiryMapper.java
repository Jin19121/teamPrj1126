package com.example.be.mapper.cs.inquiry;

import com.example.be.dto.cs.inquiry.Inquiry;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface InquiryMapper {

    @Insert("""
            INSERT INTO inquiry
                (category, writer, title, content, secret)
            VALUES (#{category}, #{writer}, #{title}, #{content}, #{secret})
            """)
    @Options(keyProperty = "id", useGeneratedKeys = true)
    int insertInquiry(Inquiry inquiry);

    @Select("""
            SELECT id, title, writer, updated
            FROM inquiry
            ORDER BY updated DESC
            """)
    List<Inquiry> selectAll();

    @Select("""
            SELECT *
            FROM inquiry
            WHERE id = #{id}
            """)
    Inquiry selectById(int id);

    @Update("""
            update inquiry
            SET category = #{category},
                title = #{title},
                content = #{content},
                secret = #{secret},
                updated = NOW()
            WHERE id = #{id}
            """)
    int updateById(Inquiry inquiry);

    @Delete("""
            DELETE FROM inquiry
            WHERE id = #{id}
            """)
    int deleteById(int id);

    @Select("""
            SELECT id, title, writer, updated
            FROM inquiry
            ORDER BY updated DESC
            LIMIT 5
            """)
    List<Inquiry> selectInquiryForIndex();
}
