import React, { useContext, useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { AuthenticationContext } from "../../components/context/AuthenticationProvider.jsx";
import axios from "axios";
import { Breadcrumb } from "../../components/root/Breadcrumb.jsx";
import { HStack, Icon, Stack } from "@chakra-ui/react";
import { Field } from "../../components/ui/field.jsx";
import { HiOutlineBookOpen } from "react-icons/hi";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import {
  DialogActionTrigger,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "../../components/ui/dialog.jsx";
import { Button } from "../../components/ui/button.jsx";
import { GoHeart } from "react-icons/go";
import { toaster } from "../../components/ui/toaster.jsx";
import { formattedDateTime } from "../../components/utils/FormattedDateTime.jsx";

function NoticeView(props) {
  const { id } = useParams();
  const [notice, setNotice] = useState({});
  const [myNoticeLike, setMyNoticeLike] = useState(false);
  const [noticeList, setNoticeList] = useState([]);
  const [search, setSearch] = useState({ type: "all", keyword: "" });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countNotice, setCountNotice] = useState("");
  const authentication = useContext(AuthenticationContext);
  const { hasAccessByNickName } = useContext(AuthenticationContext);
  const { pathname } = useLocation();
  const [titleLength, setTitleLength] = useState("");
  const [creationDate, setCreationDate] = useState("");

  useEffect(() => {
    axios
      .get(`/api/notice/view/${id}`, { id })
      .then((e) => {
        setNotice(e.data);
        setMyNoticeLike(e.data.myNoticeLike);
        setTitleLength(e.data.title.length);
        setCreationDate(e.data.creationDate.substring(0, 19));
      })
      .catch((e) => {
        const message = e.request.response.message || {
          type: "error",
          text: "존재하지 않는 게시물입니다.",
        };
        toaster.create({
          type: message.type,
          description: message.text,
        });
        navigate(`/notice/list`);
      });
    window.scrollTo(0, 0);
  }, [pathname]);

  const handleDeleteClick = () => {
    axios
      .delete(`/api/notice/delete/${id}`)
      .then((e) => {
        const deleteSuccess = e.data.message;
        toaster.create({
          type: deleteSuccess.type,
          description: deleteSuccess.text,
        });
        navigate(`/notice/list`);
      })
      .catch((e) => {
        const deleteFailure = e.request.response;
        const parsingKey = JSON.parse(deleteFailure);
        const type = parsingKey.message.type;
        const text = parsingKey.message.text;
        toaster.create({
          type: type,
          description: text,
        });
        navigate(`/`);
      });
  };

  const handleEditClick = () => {
    navigate(`/notice/edit/${id}`);
  };

  const fetch = () => {
    axios
      .get(`/api/notice/fetch/${id}`)
      .then((res) => {
        setNotice(res.data);
        setMyNoticeLike(res.data.myNoticeLike);
      })
      .catch((err) => console.error(err));
  };

  function handleLoginClick() {
    navigate(`/member/login`);
  }

  const handleLikeClick = () => {
    axios
      .post(`/api/notice/like/${id}`)
      .then(() => {
        fetch();
      })
      .finally(() => setMyNoticeLike(!myNoticeLike));
  };

  function handleWriteClick() {
    navigate(`/notice/write`);
  }

  return (
    <div className={"notice"}>
      <Breadcrumb
        depth1={"공지사항"}
        navigateToDepth1={() => navigate(`/notice/list`)}
        depth2={
          titleLength > 15
            ? `${notice.title.substring(0, 15)}...`
            : notice.title
        }
        navigateToDepth2={() => navigate(`/notice/view/${notice.id}`)}
      />

      <div className={"body-normal"}>
        <h1>공지사항</h1>
        <h2>공지사항 외 문의는 문의 게시판을 이용해주세요.</h2>

        <div className={"like-wrap"}>
          {authentication.isAuthenticated && (
            <ul>
              <li className={"icon"}>
                <Icon
                  color="red.600"
                  onClick={() => {
                    handleLikeClick();
                  }}
                >
                  {myNoticeLike ? <IoMdHeart /> : <IoMdHeartEmpty />}
                </Icon>
              </li>
              <li>{notice.like}</li>
            </ul>
          )}

          {authentication.isAuthenticated || (
            <Stack>
              <DialogRoot>
                <DialogTrigger>
                  <Icon fontSize="8xl" color="red.600">
                    <IoMdHeartEmpty />
                  </Icon>
                  <DialogContent>
                    <DialogHeader>MyTravel</DialogHeader>
                    <DialogBody>
                      로그인을 한 회원만 게시글 추천이 가능합니다.
                    </DialogBody>
                    <DialogFooter>
                      <DialogActionTrigger>
                        <Button onClick={handleLoginClick}>확인</Button>
                      </DialogActionTrigger>
                    </DialogFooter>
                  </DialogContent>
                </DialogTrigger>
              </DialogRoot>
              <h5>{notice.like}</h5>
            </Stack>
          )}
        </div>

        <div className={"btn-wrap"}>
          {authentication.isAdmin && (
            <button
              className={"btn btn-dark-outline"}
              onClick={handleWriteClick}
            >
              글 쓰기
            </button>
          )}

          {hasAccessByNickName(notice.writer) && (
            <div>
              <button className={"btn btn-dark"} onClick={handleEditClick}>
                수정
              </button>

              <DialogRoot>
                <DialogTrigger>
                  <button className={"btn btn-warning"}>삭제</button>
                  <DialogContent>
                    <DialogHeader>글 삭제</DialogHeader>
                    <DialogBody>{id}번 게시물을 삭제하시겠습니까?</DialogBody>
                    <DialogFooter>
                      <Button>취소</Button>
                      <DialogActionTrigger>
                        <Button onClick={handleDeleteClick}>삭제</Button>
                      </DialogActionTrigger>
                    </DialogFooter>
                  </DialogContent>
                </DialogTrigger>
              </DialogRoot>
            </div>
          )}
        </div>

        <table className={"table-view"}>
          <thead>
            <tr className={"thead-title"}>
              <th colSpan={2}>{notice.title}</th>
            </tr>
            <tr className={"thead-sub-title"}>
              <th>{notice.writer}</th>
              <th>{formattedDateTime(notice.creationDate)}</th>
            </tr>
            <tr className={"thead-sub-title"}>
              <th>
                <GoHeart /> {notice.numberOfLikes} |{" "}
              </th>
              <th>
                <HiOutlineBookOpen /> {notice.numberOfViews}
              </th>
            </tr>
            <tr>
              <th colSpan={2}>조회수 {notice.views}</th>
            </tr>
          </thead>

          <tbody>
            <tr className={"tbody-content"}>
              <td>{notice.content}</td>
            </tr>
          </tbody>
        </table>

        <div>
          <div>
            <Field readOnly>
              <HStack>
                <Icon fontSize="2xl">
                  <HiOutlineBookOpen />
                </Icon>{" "}
                : {notice.views} | {creationDate}
              </HStack>
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoticeView;
