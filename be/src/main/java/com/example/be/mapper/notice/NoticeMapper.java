package com.example.be.mapper.notice;

import com.example.be.dto.notice.Notice;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.Map;

@Mapper
public interface NoticeMapper {

    @Select("""
                    <script>
                    SELECT id, title, writer, inserted creationDate
                    FROM notice
                    WHERE 
                            <if test="searchType == 'all'">
                                title LIKE CONCAT('%',#{searchKeyword},'%')
                             OR writer LIKE CONCAT('%',#{searchKeyword},'%')
                             OR content LIKE CONCAT('%',#{searchKeyword},'%')
                            </if>
                            <if test="searchType != 'all'">
                                 <choose>
                                     <when test="searchType == 'title'">
                                         title LIKE CONCAT('%', #{searchKeyword}, '%')
                                     </when>
                                     <when test="searchType == 'writer'">
                                         writer LIKE CONCAT('%', #{searchKeyword}, '%')
                                     </when>
                                     <when test="searchType == 'content'">
                                         content LIKE CONCAT('%', #{searchKeyword}, '%')
                                     </when>
                                     <otherwise>
                                         1 = 0 
        <!-- 허용되지 않은 searchType이면 빈 결과 반환 -->
                                     </otherwise>
                                 </choose>
                             </if>
                    ORDER BY id DESC
                    LIMIT #{pageList},10    
                    </script>
        """)
    List<Notice> listUp(Integer pageList, String searchType, String searchKeyword);

    @Select("""
        SELECT COUNT(*)
        FROM notice_like
        WHERE notice_id=#{id}
        """)
    Integer countLikesByNoticeId(Integer id);

    @Select("""
        SELECT views
        FROM notice
        WHERE id=#{id}
        """)
    Integer checkViews(Integer id);

    @Select("""
                    <script>
                    SELECT COUNT(*)
                    FROM notice
        WHERE 
                                        <if test="searchType == 'all'">
                                            title LIKE CONCAT('%',#{searchKeyword},'%')
                                         OR writer LIKE CONCAT('%',#{searchKeyword},'%')
                                         OR content LIKE CONCAT('%',#{searchKeyword},'%')
                                        </if>
                                        <if test="searchType != 'all'">
                                             <choose>
                                                 <when test="searchType == 'title'">
                                                     title LIKE CONCAT('%', #{searchKeyword}, '%')
                                                 </when>
                                                 <when test="searchType == 'writer'">
                                                     writer LIKE CONCAT('%', #{searchKeyword}, '%')
                                                 </when>
                                                 <when test="searchType == 'content'">
                                                     content LIKE CONCAT('%', #{searchKeyword}, '%')
                                                 </when>
                                                 <otherwise>
                                                     1 = 0 
                    <!-- 허용되지 않은 searchType이면 빈 결과 반환 -->
                                                 </otherwise>
                                             </choose>
                                         </if>
            </script>
        """)
    Integer countAllNotice(String searchType, String searchKeyword);

    @Select("""
        SELECT id, title, content, writer, inserted creationDate
        FROM notice
        WHERE id = #{id}
        """)
    Map<String, Object> viewNotice(Integer id);

    @Select("""
        SELECT nickname
        FROM member
        WHERE email = #{email}
        """)
    String findNickname(String email);

    @Select("""
        SELECT COUNT(*)
        FROM notice_like
        WHERE notice_id=#{id} AND person=#{person}
        """)
    int findLikeByIdAndNickname(Integer id, String person);

    @Update("""
        UPDATE notice
        SET views=#{views}
        WHERE id=#{id}
        """)
    int updateViews(int views, Integer id);

    @Select("""
        SELECT auth
        FROM auth
        WHERE member_email=#{email}
        """)
    String findAuth(String email);

    @Insert("""
        INSERT INTO notice (title, content, writer)
        VALUES (#{title}, #{content}, #{writer})
        """)
    @Options(keyProperty = "id", useGeneratedKeys = true)
    int writeNotice(Notice notice);

    @Select("""
        SELECT writer
        FROM notice
        WHERE id=#{id}
        """)
    String findNicknameByCommunityId(Integer id);

    @Update("""
        UPDATE notice
        SET title = #{title}, content = #{content}
        WHERE id=#{id}
        """)
    int editNotice(Notice notice);

    @Delete("""
        DELETE FROM notice_like
        WHERE notice_id=#{id}
        """)
    int deleteLikeByNoticeId(Integer id);

    @Delete("""
        DELETE FROM notice
        WHERE id = #{id}
        """)
    int deleteNotice(Integer id);

    @Delete("""
        DELETE FROM notice_like
        WHERE notice_id=#{id} AND person=#{person}
        """)
    int deleteLikeInNotice(Integer id, String person);

    @Insert("""
        INSERT INTO notice_like (notice_id, person)
        VALUES (#{id}, #{person})
        """)
    int InputLikeInNotice(Integer id, String person);

    @Select("""
        SELECT notice_id noticeId
        FROM notice_like
        WHERE person=#{nickname}
        """)
    List<Integer> selectWholeNoticeLikeByNickName(String nickname);

    @Delete("""
        DELETE FROM notice_like
        WHERE notice_id=#{likeNoticeId} AND person=#{likeUser}
        """)
    int deleteLikeByInformation(Integer likeNoticeId, String likeUser);

    // 메인 화면에 필요한 일부 plan 리스트 가져오기 (최신 5개)
    @Select("""
        SELECT id, title, writer, inserted creationDate
        FROM notice
        ORDER BY inserted DESC
        LIMIT 5
        """)
    List<Notice> getTop5ByOrderByInserted();
}
