import React, { useContext, useEffect, useState } from "react";
import { Box, Input, Stack, Textarea } from "@chakra-ui/react";
import { Field } from "../../components/ui/field.jsx";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Button } from "../../components/ui/button.jsx";
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
import { ImageFileView } from "../../Image/ImageFileView.jsx";
import { AuthenticationContext } from "../../components/context/AuthenticationProvider.jsx";

function TourView() {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState({ cart: false });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { hasAccess, isAuthenticated, isAdmin } = useContext(
    AuthenticationContext,
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return; // id가 없으면 실행하지 않음
    axios.get(`/api/tour/view/${id}`).then((res) => setTour(res.data));
  }, [id]);

  if (tour === null) {
    return <p>존재하지 않는 상품 정보입니다.</p>;
  }

  const handleDeleteClick = () => {
    axios
      .delete(`/api/tour/delete/${tour.id}`)
      .then((res) => res.data)
      .then((data) => {
        toaster.create({
          type: data.message.type,
          description: data.message.text,
        });
        navigate("/tour/list");
      })
      .catch((e) => {
        const data = e.response.data;
        toaster.create({
          type: data.message.type,
          description: data.message.text,
        });
      })
      .finally(() => {
        setOpen(false);
      });
  };

  const handleAddToCartClick = () => {
    if (!isAuthenticated) {
      toaster.create({
        type: "warning",
        description: "로그인 후 사용 가능합니다.",
      });
      navigate(`/member/login`);
      return;
    }
    axios
      .post(`/api/tour/cart`, {
        id: tour.id,
        email: tour.partnerEmail,
        cart: { startDate, endDate },
      })
      .then((res) => res.data)
      .then((data) => {
        setCart(data);
        toaster.create({
          type: data.message.type,
          description: data.message.text,
        });
      })
      .catch((e) => {
        const data = e.response.data;
        toaster.create({
          type: data.message.type,
          description: data.message.text,
        });
      });
  };

  return (
    <Box>
      <h1>{tour.title}</h1>
      <Stack>
        <Field label={"상품"} readOnly>
          <Input value={tour.product} />
        </Field>
        <ImageFileView files={tour.fileList} />
        <Field label={"위치"} readOnly>
          <Input value={tour.location} />
        </Field>
        <Field label={"가격"} readOnly>
          <Input value={tour.price} />
        </Field>
        <ul className={"period"}>
          날짜 선택
          <li>
            <label htmlFor="startDate">시작 날짜</label>
            <input
              type={"date"}
              id={"startDate"}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </li>
          <li>
            <label htmlFor="endDate">종료 날짜</label>
            <input
              type={"date"}
              id={"endDate"}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </li>
        </ul>
        <Box>
          <button className={"btn btn-dark"} onClick={handleAddToCartClick}>
            장바구니에 담기
          </button>
        </Box>
        <Field label={"내용"} readOnly>
          <Textarea value={tour.content} />
        </Field>
        <Field label={"제공사"} readOnly>
          <Input value={tour.partner} />
        </Field>

        {(hasAccess(tour.partnerEmail) || isAdmin) && (
          <Box>
            <button
              className={"btn btn-dark"}
              onClick={() => navigate(`/tour/update/${id}`)}
            >
              수정
            </button>
            <DialogRoot open={open} onOpenChange={(e) => setOpen(e.open)}>
              <DialogTrigger>
                <button className={"btn btn-warning"}>삭제</button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>삭제 확인</DialogTitle>
                </DialogHeader>
                <DialogBody>
                  <p>{tour.title} 게시물을 삭제하시겠습니까?</p>
                </DialogBody>
                <DialogFooter>
                  <DialogActionTrigger>
                    <Button>취소</Button>
                  </DialogActionTrigger>
                  <Button onClick={handleDeleteClick}>삭제</Button>
                </DialogFooter>
              </DialogContent>
            </DialogRoot>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

export default TourView;
