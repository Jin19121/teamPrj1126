import { useNavigate, useSearchParams } from "react-router-dom";
import { useContext, useEffect } from "react";
import axios from "axios";
import { AuthenticationContext } from "../../components/context/AuthenticationProvider.jsx";
import { toaster } from "../../components/ui/toaster.jsx";

export function MemberLoginProcess() {
  const [searchParams] = useSearchParams();
  const { login } = useContext(AuthenticationContext);
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get("code");

    if (code) {
      const data = new URLSearchParams();
      data.append("grant_type", "authorization_code");
      data.append("client_id", import.meta.env.VITE_KAKAO_LOGIN_API_KEY); // REST API 키
      data.append(
        "redirect_uri",
        "http://43.201.70.26:8080/member/login/process",
      ); // 리다이렉트 URI
      data.append("code", code); // 인가 코드

      //카카오에 토큰 요청
      axios
        .post("https://kauth.kakao.com/oauth/token", data, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
          },
        })
        .then((response) => {
          const tokenData = response.data;
          // console.log("토큰 정보", tokenData);
          if (tokenData.access_token) {
            //사용자 정보 요청
            axios
              .post(
                "https://kapi.kakao.com/v2/user/me",
                {},
                {
                  headers: {
                    Authorization: `Bearer ${tokenData.access_token}`,
                    "Content-Type":
                      "application/x-www-form-urlencoded;charset=utf-8",
                  },
                },
              )
              .then((userResponse) => {
                //사용자 정보 읽기
                const userInfo = userResponse.data;
                const nickname = userInfo.properties.nickname;
                const imageSrc =
                  userInfo.kakao_account.profile.profile_image_url;
                const kakaoId = userInfo.id;
                const kakaoEmail = userInfo.kakao_account.email;

                //백엔드 전달
                axios
                  .post(`/api/member/login/kakao`, {
                    nickname,
                    imageSrc,
                    kakaoEmail,
                  })
                  .then((r) => r.data)
                  .then((data) => {
                    const message = data.message;
                    toaster.create({
                      type: message.type,
                      description: message.text,
                    });
                    //데이터 존재할 시 로그인 처리 및 홈페이지로 이동
                    login(data.token);
                    navigate("/");
                  })
                  .catch(() => {
                    //기존 정보 없으면 kakao 회원 가입 추가
                    navigate("/member/signup/kakao", {
                      state: {
                        kakaoNickname: nickname,
                        kakaoImageSrc: imageSrc,
                        kakaoEmail,
                      },
                    });
                  });
              })
              .catch((error) => {
                console.error("카카오 사용자 정보 요청 실패:", error);
              });
          } else {
            console.error("토큰 요청 실패:", tokenData);
          }
        })
        .catch((error) => console.error("카카오 토큰 요청 실패:", error));
    }
  }, [window.location.search]);

  return <>로그인 진행중...</>;
}
