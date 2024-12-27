import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { ProfileImageView } from "../../components/Image/ProfileImageView.jsx";
import Access from "../../components/context/Access.jsx";
import "./Member.css";

function MemberInfo(props) {
  const [member, setMember] = useState(null);
  const { email } = useParams();

  useEffect(() => {
    axios.get(`/api/member/${email}`).then((res) => setMember(res.data));
  }, []);

  if (!member) {
    return <Access />;
  }

  return (
    <div className={"member-info"}>
      <h1>회원 정보</h1>

      <ProfileImageView files={member.profile} />

      <div className={"form-wrap"}>
        <fieldset>
          <ul>
            <li>
              <label htmlFor="email">이메일</label>
              <input type={"text"} id={email} readOnly value={member.email} />
            </li>

            <li>
              <label htmlFor="nickname">닉네임</label>
              <input
                type={"text"}
                id={"nickname"}
                readOnly
                value={member.nickname}
              />
            </li>

            {member.kakao || (
              <li>
                <label htmlFor="password">비밀번호</label>
                <input
                  type={"password"}
                  id={"password"}
                  readOnly
                  value={member.password}
                />
              </li>
            )}

            <li>
              <label htmlFor="name">이름</label>
              <input type={"text"} id={"name"} readOnly value={member.name} />
            </li>

            <li>
              <label htmlFor="phone">전화번호</label>
              <input
                type={"number"}
                id={"phone"}
                readOnly
                value={member.phone}
              />
            </li>

            <li>
              <label htmlFor="inserted">가입 일시</label>
              <input
                type={"datetime-local"}
                id={"inserted"}
                readOnly
                value={member.inserted}
              />
            </li>

            {member.kakao && (
              <li>
                <label htmlFor="kakao">연동 계정</label>
                <input type={"text"} readOnly value={"카카오톡"} />
              </li>
            )}
          </ul>
        </fieldset>
      </div>
    </div>
  );
}

export default MemberInfo;
