import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toaster } from "../../components/ui/toaster.jsx";
import { AuthenticationContext } from "../../components/context/AuthenticationProvider.jsx";
import { Image } from "@chakra-ui/react";

function CartList() {
  const [cartList, setCartList] = useState([]);
  const [checkedList, setCheckedList] = useState([]);
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthenticationContext);

  useEffect(() => {
    axios.get("/api/cart/list").then((res) => setCartList(res.data));
  }, []);

  if (!isAuthenticated) {
    return (
      <div>
        <h1>장바구니 목록</h1>
        로그인 후 사용 가능합니다.
        <a href="/member/login">로그인 페이지로 </a>
        <a href="/member/signup">회원 가입 페이지로</a>
      </div>
    );
  }

  function handleRowClick(id) {
    navigate(`/tour/view/${id}`);
  }

  const handleDeleteClick = (id, cart) => {
    axios
      .delete(`/api/cart/delete/${id}`)
      .then((res) => res.data)
      .then((data) => {
        toaster.create({
          type: data.message.type,
          description: data.message.text,
        });
        setCartList((prevList) => prevList.filter((c) => c.id !== id));
        setCheckedList(checkedList.filter((r) => r.product !== cart.product));
      })
      .catch((e) => {
        const data = e.response.data;
        toaster.create({
          type: data.message.type,
          description: data.message.text,
        });
      });
  };

  function handleCheckboxChange(cart) {
    if (checkedList.includes(cart)) {
      setCheckedList(checkedList.filter((r) => r.product !== cart.product));
    } else {
      setCheckedList([...checkedList, cart]);
    }
  }

  function handlePayButton() {
    if (checkedList.length === 0) {
      toaster.create({
        type: "error",
        description: "결제할 항목을 선택해 주세요.",
      });
      return;
    }
    //창 이동 + 정보 전달
    navigate(`/payment`, { state: { tour: checkedList } });
  }

  // checkedList의 price 합산 함수
  const calculateTotalPrice = () => {
    return checkedList.reduce((sum, cart) => sum + cart.price, 0);
  };

  function handleDeleteAll() {
    //checkList의 모든 항목 cartList에서 삭제
    const deletePromise = checkedList.map((cart) =>
      axios.delete(`/api/cart/delete/${cart.id}`),
    );

    Promise.all(deletePromise)
      .then(() => {
        setCartList((prev) =>
          prev.filter((cart) => !checkedList.includes(cart)),
        );
        setCheckedList([]);
        toaster.create({
          type: "success",
          description: "선택한 항목이 삭제되었습니다.",
        });
      })
      .catch((e) => {
        const data = e.response?.data;
        toaster.create({
          type: "error",
          description: "오류로 인해 삭제할 수 없습니다.",
        });
      });
  }

  const isCartEmpty = !cartList || cartList.length === 0;

  return (
    <div>
      <h1>장바구니 목록</h1>
      {isCartEmpty ? (
        <p>장바구니가 비어 있습니다.</p>
      ) : (
        <div>
          <table className={"table-list"}>
            <tbody>
              {cartList.map((cart) => (
                <tr key={cart.id} onClick={() => handleRowClick(cart.id)}>
                  <td>
                    <input
                      type={"checkbox"}
                      checked={checkedList.some(
                        (r) => r.product === cart.product,
                      )}
                      onClick={(e) => e.stopPropagation()} // 이벤트 전파 막기
                      onChange={() => handleCheckboxChange(cart)}
                    />
                  </td>
                  <td>
                    <Image key={cart.image} src={cart.src} w="200px" />
                  </td>
                  <td>{cart.product}</td>
                  <td>{cart.title}</td>
                  <td>{cart.location}</td>
                  <td>{cart.price}</td>
                  <td>
                    {cart.startDate} ~ {cart.endDate}
                  </td>
                  <button
                    className={"btn btn-warning"}
                    key={cart.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(cart.id, cart);
                    }}
                  >
                    삭제
                  </button>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <br />
      {cartList.length === 0 || (
        <div>
          <h2>선택한 제품</h2>
          <form>
            <table className={"table-list"}>
              <thead>
                <tr>
                  <th>
                    <label htmlFor="product">상품</label>
                  </th>
                  <th>
                    <label htmlFor="price">가격</label>
                  </th>
                </tr>
              </thead>
              <tbody>
                {checkedList.map((cart) => (
                  <tr>
                    <td>
                      <input value={cart.product} />
                    </td>
                    <td>
                      <input value={cart.price} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </form>
          <button className={"btn btn-dark"} onClick={handlePayButton}>
            총 {calculateTotalPrice()}원 결제
          </button>
          <button className={"btn btn-warning"} onClick={handleDeleteAll}>
            선택 삭제
          </button>
        </div>
      )}
    </div>
  );
}

export default CartList;
