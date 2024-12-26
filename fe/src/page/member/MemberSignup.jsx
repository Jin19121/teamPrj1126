import React, { useContext, useState } from "react";
import { toaster } from "../../components/ui/toaster.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Member.css";
import { AuthenticationContext } from "../../components/context/AuthenticationProvider.jsx";
import { Button } from "../../components/ui/button.jsx";
import {
  FileUploadList,
  FileUploadRoot,
  FileUploadTrigger,
} from "../../components/ui/file-button.jsx";
import { HiUpload } from "react-icons/hi";

function MemberSignup(props) {
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [files, setFiles] = useState([]);
  const [emailCheck, setEmailCheck] = useState(false);
  const [nicknameCheck, setNicknameCheck] = useState(true);
  const [passwordCheck, setPasswordCheck] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthenticationContext);

  if (isAuthenticated) {
    alert("현재 로그인 상태입니다. 회원가입을 위해선 로그아웃이 필요합니다.");
    navigate(`/`);
  }

  function handleSignupClick() {
    axios
      .postForm("/api/member/signup", {
        email,
        nickname,
        password,
        name,
        phone,
        files,
      })
      .then((res) => {
        const message = res.data.message;
        toaster.create({
          type: message.type,
          description: message.text,
        });
        navigate(`/member/login`);
      })
      .catch((e) => {
        const message = e.response.data.message;
        toaster.create({
          type: message.type,
          description: message.text,
        });
      });
  }

  const handleEmailCheckClick = () => {
    axios
      .get("/api/member/check", {
        params: { email },
      })
      .then((res) => res.data)
      .then((data) => {
        const message = data.message;
        toaster.create({
          type: message.type,
          description: message.text,
        });
        setEmailCheck(data.available);
      });
  };

  const handleNicknameCheckClick = () => {
    axios
      .get(`/api/member/check`, {
        params: { nickname },
      })
      .then((res) => res.data)
      .then((data) => {
        const message = data.message;
        toaster.create({
          type: message.type,
          description: message.text,
        });
        setNicknameCheck(data.available);
      });
  };

  let nicknameCheckButtonDisabled = nickname.length === 0;

  let disabled = true;

  if (emailCheck) {
    if (nicknameCheck && nickname != "") {
      if (password === passwordCheck) {
        disabled = false;
      }
    }
  }

  const filesList = [];
  for (const file of files) {
    filesList.push(<li>{file.name}</li>);
  }

  let passwordInvalid = false;
  if (password != passwordCheck) {
    passwordInvalid = true;
  }

  const REST_API_KEY = import.meta.env.VITE_KAKAO_LOGIN_API_KEY;
  const redirect_uri = "http://43.201.70.26:8080/member/login/process";
  const handleKakaoSignup = () => {
    window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${redirect_uri}&response_type=code&prompt=login`;
  };

  return (
    <div className={"member body-narrow"}>
      <h1>회원 가입</h1>

      <div className={"member-form"}>
        <fieldset>
          <ul>
            <li>
              <label htmlFor="">프로필 사진</label>
              <div className={"attached"} style={{ marginTop: "10px" }}>
                <FileUploadRoot
                  value={files}
                  onChange={() => setFiles(e.target.value)}
                >
                  <FileUploadTrigger asChild>
                    <Button variant="outline" size="sm">
                      <HiUpload /> 프로필 사진 업로드
                    </Button>
                  </FileUploadTrigger>
                  <FileUploadList showSize clearable />
                </FileUploadRoot>
              </div>

              {files && files.length > 0 && (
                <div className="file-preview">
                  <h4>선택된 파일:</h4>
                  <ul>
                    {Array.from(files).map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </li>

            <li className={"check-form"}>
              <form>
                <label htmlFor="email">
                  이메일
                  <span className={"required"}>&#42;</span>
                </label>
              </form>
              <div className={"duplicate-check"}>
                <input
                  placeholder={"중복 확인을 해주세요."}
                  id={"email"}
                  type="email"
                  maxLength="30"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmailCheck(false);
                    setEmail(e.target.value);
                  }}
                />
                <button
                  className={"btn-check btn-dark"}
                  onClick={handleEmailCheckClick}
                >
                  중복 확인
                </button>
              </div>
            </li>

            <li className={"check-form"}>
              <form>
                <label htmlFor="nickname">
                  닉네임
                  <span className={"required"}>&#42;</span>
                </label>
              </form>
              <div className={"duplicate-check"}>
                <input
                  placeholder={"중복 확인을 해주세요."}
                  id={"nickname"}
                  type={"text"}
                  maxLength="20"
                  required
                  value={nickname}
                  onChange={(e) => {
                    setNicknameCheck(false);
                    setNickname(e.target.value);
                  }}
                />
                <button
                  className={"btn-check btn-dark"}
                  onClick={handleNicknameCheckClick}
                  disabled={nicknameCheckButtonDisabled}
                >
                  중복 확인
                </button>
              </div>
            </li>

            <li>
              <form>
                <label htmlFor="password">
                  비밀번호
                  <span className={"required"}>&#42;</span>
                </label>
              </form>

              <input
                placeholder={"30자 이내"}
                maxLength="30"
                id={"password"}
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </li>

            <li>
              <form>
                <label htmlFor="password-check">
                  비밀번호 확인
                  <span className={"required"}>&#42;</span>
                </label>
              </form>
              <input
                placeholder={"비밀번호를 다시 한 번 입력해주세요."}
                maxLength="30"
                id={"password-check"}
                type="password"
                required
                value={passwordCheck}
                onChange={(e) => setPasswordCheck(e.target.value)}
              />
              {/* 비밀번호가 일치하지 않을 경우 에러 메시지 표시 */}
              {password && passwordCheck && password !== passwordCheck && (
                <p style={{ color: "red", fontSize: "14px" }}>
                  비밀번호가 일치하지 않습니다.
                </p>
              )}
            </li>

            <li>
              <form>
                <label htmlFor="name">
                  이름
                  <span className={"required"}>&#42;</span>
                </label>
              </form>
              <input
                placeholder={"20자 이내"}
                maxLength="20"
                id={"name"}
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </li>
            <li>
              <form>
                <label htmlFor="phone">
                  전화번호
                  <span className={"required"}>&#42;</span>
                </label>
              </form>
              <input
                placeholder={"숫자만 입력해주세요."}
                maxLength="20"
                id={"phone"}
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </li>
          </ul>
        </fieldset>

        <div className={"btn-wrap"}>
          <button
            className={"btn-wide btn-dark"}
            onClick={handleSignupClick}
            disabled={disabled}
          >
            가입
          </button>
        </div>
        <div className={"btn-wrap"}>
          <button className={"btn-wide btn-kakao"} onClick={handleKakaoSignup}>
            카카오로 간편 가입
          </button>
        </div>
        <div className={"move-to-button"}>
          <p>이미 가입을 하셨나요?</p>
          <p className={"link"} onClick={() => navigate(`/member/login`)}>
            로그인
          </p>
        </div>
      </div>
    </div>
  );
}

export default MemberSignup;
