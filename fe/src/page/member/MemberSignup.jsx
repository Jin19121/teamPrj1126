import React, { useState } from "react";
import { Box, Group, Input, Stack } from "@chakra-ui/react";
import { Button } from "../../components/ui/button.jsx";
import { toaster } from "../../components/ui/toaster.jsx";
import axios from "axios";
import { Field } from "../../components/ui/field.jsx";
import { useNavigate } from "react-router-dom";

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

  return (
    <Box>
      <h1>회원 가입</h1>
      <Stack>
        <Box>
          <input
            onChange={(e) => setFiles(e.target.files)}
            type={"file"}
            accept={"image/*"}
            multiple
          />
          <Box>{filesList}</Box>
        </Box>
        <Field label={"이메일"}>
          <Group attached w={"100%"}>
            <Input
              value={email}
              onChange={(e) => {
                setEmailCheck(false);
                setEmail(e.target.value);
              }}
            />
            <Button onClick={handleEmailCheckClick} variant={"outline"}>
              중복 확인
            </Button>
          </Group>
        </Field>
        <Field label={"닉네임"}>
          <Group attached w={"100%"}>
            <Input
              value={nickname}
              onChange={(e) => {
                setNicknameCheck(false);
                setNickname(e.target.value);
              }}
            />
            <Button
              onClick={handleNicknameCheckClick}
              disabled={nicknameCheckButtonDisabled}
              variant={"outline"}
            >
              중복 확인
            </Button>
          </Group>
        </Field>
        <Field label={"비밀번호"}>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Field label={"비밀번호 확인"}>
          <Input
            value={passwordCheck}
            onChange={(e) => setPasswordCheck(e.target.value)}
          />
        </Field>
        <Field label={"이름"}>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label={"전화번호"}>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>

        <Box>
          <Button onClick={handleSignupClick} disabled={disabled}>
            가입
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

export default MemberSignup;
