import React, { useContext, useEffect, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";
import { Center, Image } from "@chakra-ui/react";
import { AuthenticationContext } from "../../components/context/AuthenticationProvider.jsx";
import { Breadcrumb } from "../../components/root/Breadcrumb.jsx";
import RandomString from "../../components/login/RandomString.jsx";
import { formatNumberWithCommas } from "../../components/utils/FormatNumberWithCommas.jsx";
import PortOne from "@portone/browser-sdk/v2";

const { VITE_STORE_ID, VITE_KAKAOPAY_CHANNEL_KEY, VITE_TOSSPAY_CHANNEL_KEY } =
  import.meta.env;

function Payment() {
  const location = useLocation();
  const [tour, setTour] = useState(null);
  const [waitingPayment, setWaitingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState({
    status: "IDLE",
  });
  const { email } = useContext(AuthenticationContext);
  const navigate = useNavigate();
  const paymentId = RandomString();
  const currency = "CURRENCY_KRW";
  const payMethod = "EASY_PAY";

  useEffect(() => {
    if (location.state && location.state.tour) {
      setTour(location.state.tour);
    }
  }, [location.state]);

  if (tour == null) {
    return (
      <dialog open>
        <article aria-busy>결제 정보를 불러오는 중입니다.</article>
      </dialog>
    );
  }

  const handleKakaoSubmit = async (e) => {
    e.preventDefault();
    setWaitingPayment(true);

    const kakaoPayment = await PortOne.requestPayment({
      storeId: VITE_STORE_ID,
      channelKey: VITE_KAKAOPAY_CHANNEL_KEY,
      paymentId,
      orderName: tour[0].product + " 그 외",
      totalAmount,
      currency,
      payMethod,
    });

    if (kakaoPayment.code != null) {
      // 실패 내용
      setWaitingPayment(false);
      window.alert(`결제 실패: ${kakaoPayment.message}`); // alert 팝업창
      setPaymentStatus({
        status: "FAILED",
        message: kakaoPayment.message,
      });
      return;
    }

    // payment/complete 엔드포인트 구현
    const kakaoResponse = await fetch(`/api/payment/payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      //paymentId와 주문정보를 서버에 전달
      body: JSON.stringify({
        tourList: tour,
        paymentId,
        amount: totalAmount,
        payMethod,
        currency,
        buyerEmail: email,
      }),
    });

    if (kakaoResponse.ok) {
      const paymentComplete = await kakaoResponse.json();

      if (paymentComplete.status === "SUCCESS") {
        setPaymentStatus({ status: "SUCCESS" });

        const currentDate = new Date().toISOString().split("T")[0];

        navigate(`/payment/complete`, {
          state: {
            paidList: tour,
            paymentId,
            totalAmount,
            date: currentDate,
          },
        });
      } else {
        setPaymentStatus({
          status: "FAILED",
          message: "1 결제 실패" + paymentComplete.message,
        });
      }
    } else {
      setPaymentStatus({
        status: "FAILED",
        message: (await kakaoResponse.text()) || "2 결제 처리 오류",
      });
    }
  };

  const handleTossSubmit = async (e) => {
    e.preventDefault();
    setWaitingPayment(true);

    const tossPayment = await PortOne.requestPayment({
      storeId: VITE_STORE_ID,
      channelKey: VITE_TOSSPAY_CHANNEL_KEY,
      paymentId,
      orderName: tour[0].product + " 그 외",
      totalAmount,
      currency,
      payMethod,
    });

    if (tossPayment.code != null) {
      //실패 내용
      setWaitingPayment(false);
      window.alert(`결제 실패: ${tossPayment.message}`); // alert 팝업창
      setPaymentStatus({
        status: "FAILED",
        message: tossPayment.message,
      });
      return;
    }

    //결제 성공 시 백엔드로
    const tossResponse = await fetch(`/api/payment/payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      //paymentId와 주문정보를 서버에 전달
      body: JSON.stringify({
        tourList: tour,
        paymentId,
        amount: totalAmount,
        payMethod,
        currency,
        buyerEmail: email,
      }),
    });

    //백엔드의 응답에 대한 처리
    if (tossResponse.ok) {
      const paymentComplete = await tossResponse.json();

      if (paymentComplete.status === "SUCCESS") {
        setPaymentStatus({ status: "SUCCESS" });

        const currentDate = new Date().toISOString().split("T")[0];

        navigate(`/payment/complete`, {
          state: {
            paidList: tour,
            paymentId,
            totalAmount,
            date: currentDate,
          },
        });
      } else {
        setPaymentStatus({
          status: "FAILED",
          message: "1 결제 실패" + paymentComplete.message,
        });
      }
    } else {
      setPaymentStatus({
        status: "FAILED",
        message: (await tossResponse.text()) || "2 결제 처리 오류",
      });
    }
  };

  const totalPrice = () => {
    return tour.reduce((sum, tour) => sum + tour.price, 0);
  };
  const totalAmount = totalPrice();

  const handleClose = () => {
    setPaymentStatus({ status: "IDLE" });
  };

  return (
    <div className={"payment"}>
      <Breadcrumb
        depth1={"투어"}
        navigateToDepth1={() => navigate(`/tour/list`)}
        depth2={"장바구니"}
        navigateToDepth2={() => navigate(`/cart`)}
        depth3={"결제창"}
        navigateToDepth3={() => navigate(`/payment`)}
      />
      <h1>결제</h1>

      <div className={"body-normal"}>
        <form>
          <h2>결제 내역</h2>
          <div>
            <table className={"table-list"}>
              <thead>
                <tr>
                  <th colSpan={2}>상품</th>
                  <th>일정</th>
                  <th>가격</th>
                </tr>
              </thead>
              {/*결제할 상품 나열*/}
              {tour.map((product) => (
                <tbody>
                  <tr>
                    <td>
                      <Image
                        key={product.image}
                        src={product.src}
                        w={"100px"}
                      />
                    </td>
                    <td>{product.product}</td>
                    <td>
                      {product.startDate} ~ {product.endDate}
                    </td>
                    <td>{formatNumberWithCommas(product.price)}</td>
                  </tr>
                </tbody>
              ))}
              {/*총 합*/}
              <tfoot>
                <tr>
                  <td colSpan={2}></td>
                  <th>결제 금액</th>
                  <td>{formatNumberWithCommas(totalPrice())}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <br />

          <div className={"payment-method"}>
            <h2>결제 방법</h2>
            <Center>
              <button
                type={"button"}
                onClick={handleKakaoSubmit}
                style={{ cursor: "pointer" }}
                aria-busy={waitingPayment}
                disabled={waitingPayment}
              >
                <img
                  src="https://prj241114-j19121m.s3.ap-northeast-2.amazonaws.com/teamPrj1126/74/pay.jpg"
                  alt="결제 버튼"
                  width="100"
                />
              </button>
              <button
                type={"button"}
                onClick={handleTossSubmit}
                style={{ cursor: "pointer" }}
                aria-busy={waitingPayment}
                disabled={waitingPayment}
              >
                <img
                  src="https://prj241114-j19121m.s3.ap-northeast-2.amazonaws.com/teamPrj1126/74/toss.jpg"
                  alt="결제 버튼"
                  width="100"
                />
              </button>
            </Center>
          </div>
        </form>
      </div>

      {/*<div>예약자: personal info 불러오기 (수정 가능)</div>*/}
      {/*<div>여행자 정보: input text</div>*/}
      {/*<div>추가 예약 정보: textarea</div>*/}
      {/*<div>결제 방법: card, 무통장 입금</div>*/}
      {/*<div>약관 안내: text</div>*/}
    </div>
  );
}

export default Payment;
