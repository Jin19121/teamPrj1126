import React from "react";
import kakao from "../../assets/kakao_login_wide.png";
import "./kakao.css";

const REST_API_KEY = import.meta.env.VITE_KAKAO_LOGIN_API_KEY;

const redirect_uri = "http://43.201.70.26:8080/member/login/process";

const SocialKakao = () => {
  const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${redirect_uri}&response_type=code&prompt=login`;
  const handleKakaoLogin = () => {
    window.location.href = kakaoURL;
  };

  return (
    <div className={"kakao-login"}>
      <button
        className={"btn"}
        onClick={handleKakaoLogin}
        style={{ cursor: "pointer" }}
      >
        <img src={kakao} alt={"카카오 로그인"} />
      </button>
    </div>
  );
};

export default SocialKakao;
