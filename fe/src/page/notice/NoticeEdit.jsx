import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthenticationContext } from "../../components/context/AuthenticationProvider.jsx";
import axios from "axios";
import { Box, HStack, Input, Textarea } from "@chakra-ui/react";
import { Field } from "../../components/ui/field.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Alert } from "../../components/ui/alert.jsx";
import NoticeList from "./NoticeList.jsx";

function NoticeEdit(props) {
  const [notice, setNotice] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasAccessByNickName } = useContext(AuthenticationContext);

  useEffect(() => {
    axios.get(`/api/notice/view/${id}`).then((res) => {
      setNotice(res.data);
    });
  }, []);

  const handleSaveClick = () => {
    axios
      .put(`/api/notice/edit`, {
        id: notice.id,
        title: notice.title,
        content: notice.content,
      })
      .finally(navigate(`/notice/list`));
  };

  const handleCancelClick = () => {
    navigate(`/notice/view/${id}`);
  };

  return (
    <div>
      {hasAccessByNickName(notice.writer) && (
        <Box>
          <h1>공지사항 수정</h1>
          <Box
            mx={"auto"}
            w={{
              md: "500px",
            }}
          >
            <Field label={"제목"}>
              <Input
                value={notice.title}
                onChange={(e) =>
                  setNotice({ ...notice, title: e.target.value })
                }
              />
            </Field>
            <Field label={"본문"}>
              <Textarea
                value={notice.content}
                onChange={(e) =>
                  setNotice({ ...notice, content: e.target.value })
                }
                h={300}
              />
            </Field>
            <br />
            <Box>
              <HStack>
                <Button onClick={handleCancelClick}>취소</Button>
                <Button onClick={handleSaveClick}>저장</Button>
              </HStack>
            </Box>
          </Box>
        </Box>
      )}
      {hasAccessByNickName(notice.writer) || (
        <Box>
          <br />
          <br />
          <Alert status="warning" title="접근 권한이 없습니다." />
          <NoticeList />
        </Box>
      )}
    </div>
  );
}

export default NoticeEdit;