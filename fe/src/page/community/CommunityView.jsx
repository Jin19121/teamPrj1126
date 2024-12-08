import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Box, HStack, Image, Input, Stack, Textarea } from "@chakra-ui/react";
import { Field } from "../../components/ui/field.jsx";
import { Button } from "../../components/ui/button.jsx";
import {
  DialogActionTrigger,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "../../components/ui/dialog.jsx";
import { Breadcrumb } from "../../components/root/Breadcrumb.jsx";
import CommunityList from "./CommunityList.jsx";

function ImageFileView({ files }) {
  return (
    <Box>
      {files?.map((file) => (
        <Image
          key={file.fileName}
          src={file.filePath}
          border={"1px solid black"}
          m={3}
        />
      ))}
    </Box>
  );
}

function CommunityView(props) {
  const { id } = useParams();
  const [community, setCommunity] = useState({});
  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const [commentList, setCommentList] = useState([]);

  useEffect(() => {
    axios.get(`/api/community/view/${id}`, { id }).then((e) => {
      setCommunity(e.data);
      setCommentList(e.data.commentList);
    });
  }, []);
  console.log(community);
  const handleDeleteClick = () => {
    axios
      .delete(`/api/community/delete/${id}`)
      .then(navigate(`/community/list`));
  };

  const handleEditClick = () => {
    navigate(`/community/edit/${id}`);
    ///community/edit/18
  };

  const handleCommentSaveClick = () => {
    axios
      .post(`/api/community/comment/write`, {
        comment,
        communityId: community.id,
      })
      .then(navigate(`/community/view/${id}/`));
  };

  return (
    <div>
      <Breadcrumb
        depth1={"커뮤니티"}
        navigateToDepth1={() => navigate(`/community/list`)}
        depth2={community.id + "번 게시물"}
        navigateToDepth2={() => navigate(`/community/view/${id}`)}
      />
      <div>
        <br />
        <h1>{id}번 게시물</h1>
        <Stack>
          <Box>
            <Field label={"제목"} readOnly>
              <Input value={community.title} />
            </Field>
            <Field label={"본문"} readOnly>
              <Textarea value={community.content} />
            </Field>
            <Field label={"파일"} readOnly>
              <ImageFileView files={community.files} />
            </Field>
            <Field label={"작성자"} readOnly>
              <Input value={community.writer} />
            </Field>
            <Field label={"작성일시"} readOnly>
              <Input value={community.creationDate} />
            </Field>
          </Box>
          <Box>
            <HStack>
              <DialogRoot>
                <DialogTrigger>
                  <Button>삭제</Button>
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
              <Button onClick={handleEditClick}>수정</Button>
            </HStack>
          </Box>
          <br />
          {/*  TODO: 코멘트 작성, 코멘트 리스트 추가 */}
          <Box>
            <Stack>
              <Field label={community.writer + " 님에게 댓글 작성"}>
                <HStack>
                  <Textarea
                    h={100}
                    w={700}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <Button h={100} onClick={handleCommentSaveClick}>
                    댓글 등록
                  </Button>
                </HStack>
              </Field>
              <br />
              <Field label={"코멘트"}>
                {commentList.map((list) => (
                  <Box>
                    <Stack>
                      <HStack>
                        <Field>{list.writer}</Field>
                        <Field>{list.creationDate}</Field>
                      </HStack>
                      <Input value={list.comment} readOnly />
                    </Stack>
                  </Box>
                ))}
              </Field>
            </Stack>
          </Box>
          <Box>
            <CommunityList />
          </Box>
        </Stack>
      </div>
    </div>
  );
}

export default CommunityView;
