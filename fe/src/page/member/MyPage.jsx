import React, { useContext, useEffect, useState } from "react";
import { AuthenticationContext } from "../../components/context/AuthenticationProvider.jsx";
import MemberInfo from "./MemberInfo.jsx";
import TourMyList from "../tour/TourMyList.jsx";
import PaymentHistory from "../payment/PaymentHistory.jsx";
import { Breadcrumb } from "../../components/root/Breadcrumb.jsx";
import "./Member.css";
import CommunityMyList from "../community/CommunityMyList.jsx";
import CartList from "../payment/CartList.jsx";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { MemberEdit } from "./MemberEdit.jsx";
import { toaster } from "../../components/ui/toaster.jsx";
import {
  DialogActionTrigger,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog.jsx";
import { Input, Stack } from "@chakra-ui/react";
import { Field } from "../../components/ui/field.jsx";
import { Button } from "../../components/ui/button.jsx";

function MyPage(props) {
  const [selectedMenu, setSelectedMenu] = useState("profile");
  const [kakao, setKakao] = useState(false);
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);
  const [member, setMember] = useState([]);
  const { logout, isPartner, isAdmin } = useContext(AuthenticationContext);
  const { email } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`/api/member/${email}`)
      .then((res) => {
        setMember(res.data);
        setKakao(res.data.kakao);
        setPassword(res.data.password);
      })
      .catch((err) => console.error("에러 읽기", err));
  }, []);

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu);
  };

  function handleDeleteClick() {
    axios
      .delete(`/api/member/remove`, {
        data: { email, password },
      })
      .then((res) => {
        const message = res.data.message;
        toaster.create({
          type: message.type,
          description: message.text,
        });
        if (isAdmin) {
          navigate("/admin");
        } else {
          logout();
          navigate(`/`);
        }
      })
      .catch((e) => {
        const message = e.response.data.message;
        toaster.create({
          type: message.type,
          description: message.text,
        });
      })
      .finally(() => {
        setOpen(false);
        setPassword("");
      });
  }

  return (
    <div className={"member"}>
      <Breadcrumb
        depth1={"마이페이지"}
        navigateToDepth1={() => navigate(`/mypage/${id}`)}
        depth2={
          selectedMenu === "profile"
            ? "내 프로필"
            : selectedMenu === "cart"
              ? "내 장바구니"
              : selectedMenu === "paymentHistory"
                ? "결제 내역"
                : selectedMenu === "myTour"
                  ? `자사 상품`
                  : selectedMenu === "myCommunity"
                    ? `내가 쓴 글`
                    : "프로필 수정"
        }
        navigateToDepth2={() => {}}
      />

      <div className={"body-wide member-mypage"}>
        <h1>마이페이지</h1>

        <nav className={"mypage-nav"}>
          <ul>
            <li
              className={selectedMenu === "profile" ? "active" : ""}
              onClick={() => {
                handleMenuClick("profile");
              }}
            >
              내 프로필
            </li>
            <li
              className={selectedMenu === "memberEdit" ? "active" : ""}
              onClick={() => handleMenuClick("memberEdit")}
            >
              프로필 수정
            </li>
            <li
              className={selectedMenu === "paymentHistory" ? "active" : ""}
              onClick={() => handleMenuClick("paymentHistory")}
            >
              결제 내역
            </li>
            {(isPartner || isAdmin) && (
              <li
                className={selectedMenu === "myTour" ? "active" : ""}
                onClick={() => handleMenuClick("myTour")}
              >
                자사 상품
              </li>
            )}
            <li
              className={selectedMenu === "myCommunity" ? "active" : ""}
              onClick={() => handleMenuClick("myCommunity")}
            >
              내가 쓴 글
            </li>

            <li>
              <DialogRoot open={open} onOpenChange={(e) => setOpen(e.open)}>
                <DialogTrigger>
                  <p style={{ cursor: "pointer" }}>회원 탈퇴</p>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>탈퇴 확인</DialogTitle>
                  </DialogHeader>
                  {kakao || (
                    <DialogBody>
                      <Stack>
                        <p>회원 탈퇴를 위하여 비밀번호를 입력해 주십시오.</p>

                        <Field>
                          <Input
                            placeholder={"비밀번호 입력"}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </Field>
                      </Stack>
                    </DialogBody>
                  )}
                  {kakao && (
                    <DialogBody>
                      <Stack>
                        <p>
                          회원 정보 삭제를 확인하려면 텍스트 입력 필드에{" "}
                          {member.password}을 따라 입력해 주십시오
                        </p>
                        <Field>
                          <Input
                            placeholder={member.password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </Field>
                      </Stack>
                    </DialogBody>
                  )}
                  <DialogFooter>
                    <DialogActionTrigger>
                      <button className={"btn btn-dark-outline"}>취소</button>
                    </DialogActionTrigger>
                    <Button onClick={handleDeleteClick}>탈퇴</Button>
                  </DialogFooter>
                </DialogContent>
              </DialogRoot>
            </li>
          </ul>
        </nav>

        <section className={"mypage-body"}>
          {selectedMenu === "profile" && <MemberInfo />}
          {selectedMenu === "cart" && <CartList />}
          {selectedMenu === "paymentHistory" && <PaymentHistory />}
          {selectedMenu === "myTour" && <TourMyList />}
          {selectedMenu === "myCommunity" && <CommunityMyList />}
          {selectedMenu === "memberEdit" && <MemberEdit />}
        </section>
      </div>
    </div>
  );
}

export default MyPage;
