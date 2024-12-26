import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Index.css";
import { IoSearch } from "react-icons/io5";
import { FaArrowRight, FaPlus } from "react-icons/fa6";
import { IndexSlider } from "./IndexSlider.jsx";
import Calendar from "react-calendar";
import { formatNumberWithCommas } from "../components/utils/FormatNumberWithCommas.jsx";
import { formattedDate } from "../components/utils/FormattedDate.jsx";
import { AuthenticationContext } from "../components/context/AuthenticationProvider.jsx";

export function Index() {
  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [allPlans, setAllPlans] = useState([]);
  const [planList, setPlanList] = useState([]);
  const [tourList, setTourList] = useState([]);
  const [communityList, setCommunityList] = useState([]);
  const [noticeList, setNoticeList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedPlans, setSelectedPlans] = useState([]);
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthenticationContext);

  console.log("정보", window.location);

  useEffect(() => {
    axios
      .get("/api/index", {
        params: searchParams,
      })
      .then((res) => {
        setAllPlans(res.data.allPlans);
        setPlanList(res.data.plans);
        setTourList(res.data.tours);
        setCommunityList(res.data.community);
        setNoticeList(res.data.notice);
      })
      .catch((error) => {
        console.error("Error fetching index data:", error);
      });
  }, [searchParams]);

  useEffect(() => {
    // 오늘 날짜를 가져오기
    const today = new Date();
    setSelectedDate(today); // 오늘 날짜를 기본값으로 설정

    // 오늘 날짜에 해당하는 일정을 필터링
    const filteredPlans = allPlans.filter((plan) => {
      const startDate = new Date(plan.startDate);
      const endDate = new Date(plan.endDate);

      // 오늘 날짜가 startDate와 endDate 사이에 있는지 확인
      return today >= startDate && today <= endDate;
    });

    setSelectedPlans(filteredPlans); // 오늘 날짜의 일정 상태 업데이트
  }, [allPlans]); // allPlans가 변경될 때마다 실행

  useEffect(() => {
    const keyword = searchParams.get("keyword") || "";
    setSearch(keyword);
  }, [searchParams]);

  function handleSearchButton() {
    const nextSearchParam = new URLSearchParams(searchParams);

    if (search.trim().length > 0) {
      // 검색
      nextSearchParam.set("keyword", search.trim());
    } else {
      // 검색 안 함
      nextSearchParam.delete("keyword");
    }
    setSearchParams(nextSearchParam);
  }

  // 엔터 키로 검색 실행
  function handleKeyPress(event) {
    if (event.key === "Enter") {
      handleSearchButton();
    }
  }

  const isEmpty = (list) => list.length === 0;

  function handleDateChange(date) {
    setSelectedDate(date); // 선택된 날짜 상태 업데이트

    // 해당 날짜에 속하는 일정 필터링
    const filteredPlans = allPlans.filter((plan) => {
      const startDate = new Date(plan.startDate);
      const endDate = new Date(plan.endDate);

      // 선택된 날짜가 startDate와 endDate 사이에 있는지 확인
      return date >= startDate && date <= endDate;
    });

    setSelectedPlans(filteredPlans); // 해당 날짜의 일정 상태 업데이트
  }

  return (
    <div>
      {/* 검색 영역 */}
      <section className={"main-search-container"}>
        <div className={"main-search-wrap"}>
          <input
            type="search"
            placeholder={"어디로 떠나고 싶은가요?"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            className={"main-search-wrap-btn"}
            onClick={handleSearchButton}
          >
            <IoSearch />
          </button>
        </div>
      </section>

      {/* 달력 */}
      <section className={"main-calendar-section-wrap"}>
        <div className={"section-left"}>
          <Calendar
            className={"calendar"}
            formatDay={(locale, date) =>
              date.toLocaleString("en", { day: "numeric" })
            }
            showNeighboringMonth={false}
            next2Label={null}
            prev2Label={null}
            onChange={handleDateChange}
            tileContent={({ date, view }) => {
              const today = new Date();
              const isToday =
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();

              // 일정이 있는 날짜인지 확인
              const hasPlan = allPlans.some((plan) => {
                const startDate = new Date(plan.startDate);
                const endDate = new Date(plan.endDate);
                return date >= startDate && date <= endDate;
              });

              return (
                <div>
                  {isToday && <div className={"isToday"}>TODAY</div>}
                  {hasPlan && <div className={"hasPlan"}></div>}
                </div>
              );
            }}
          />
        </div>

        <div className={"section-right"}>
          <div className={"index-calendar-btn-wrap"}>
            {isAuthenticated ? (
              <button
                className={"index-calendar-btn"}
                onClick={() => navigate(`/plan/list`)}
              >
                내 여행 일정 보기
              </button>
            ) : (
              <button
                className={"index-calendar-btn"}
                onClick={() => navigate(`/member/login`)}
              >
                내 여행 일정 짜기
              </button>
            )}
            {isAuthenticated ? (
              <button
                className={"index-calendar-btn"}
                onClick={() => navigate(`/wallet/list`)}
              >
                내 지갑 내역 보기
              </button>
            ) : (
              <button
                className={"index-calendar-btn"}
                onClick={() => navigate(`/member/login`)}
              >
                내 지갑 만들기
              </button>
            )}
          </div>

          {selectedDate ? (
            <div className={"index-calendar-list"}>
              <h3>
                {selectedDate.toLocaleDateString("ko-KR", {
                  month: "long",
                  day: "numeric",
                })}
              </h3>

              <div>
                {selectedPlans.length > 0 ? (
                  selectedPlans.map((plan) => (
                    <ul key={plan.id}>
                      <li className={"calendar-list-title"}>{plan.title}</li>
                      <li className={"calendar-list-description"}>
                        {plan.description}
                      </li>
                    </ul>
                  ))
                ) : (
                  <div className={"empty-container"}>
                    <p className={"empty-container-title"}>일정이 없습니다.</p>
                    <p className={"empty-container-description"}>
                      다른 날짜를 선택해주세요.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>날짜를 선택하면 일정이 표시됩니다.</div>
          )}
        </div>
      </section>

      {/* 내 여행 */}
      {isAuthenticated ? (
        <section className={"plan-container"}>
          <div className={"plan-container-wrap"}>
            <div className={"plan-container-header"}>
              <h1>내 여행</h1>
              <button
                className={"more-btn"}
                onClick={() => navigate(`/plan/list`)}
              >
                일정 관리하러 가기
                <FaArrowRight
                  style={{
                    display: "inline",
                    marginLeft: "4px",
                    marginTop: "-3px",
                  }}
                />
              </button>
            </div>

            <div className={"plan-container-body"}>
              {isEmpty(planList) ? (
                <div className={"empty-container"}>
                  <p className={"empty-container-title"}>
                    여행 계획이 없습니다.
                  </p>
                  <p className={"empty-container-description"}>
                    새로운 계획을 추가해보세요!
                  </p>
                </div>
              ) : (
                <div className={"plan-container-card"}>
                  {planList.map((plan) => (
                    <ul
                      key={plan.id}
                      onClick={() => navigate(`/plan/view/${plan.id}`)}
                    >
                      <li className={"title"}>{plan.title}</li>
                      <li>{plan.description}</li>
                      <li>{plan.destination}</li>
                      <li>
                        {plan.startDate} ~ {plan.endDate}
                      </li>
                    </ul>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {/* 회원가입 유도 배너 */}
      {isAuthenticated || (
        <section className={"info-banner"}>
          <div className={"info-banner-wrap"}>
            <p>회원가입 없이도 투어 상품을 둘러보실 수 있습니다.</p>
            <button type={"button"} onClick={() => navigate("/member/signup")}>
              회원가입 후 더 많은 혜택 누리기
            </button>
          </div>
        </section>
      )}

      {/* 투어 */}
      <section className={"index-tour-container"}>
        <div className={"index-tour-container-header"}>
          <h1>지금 당장 떠나보세요!</h1>
          <button className={"more-btn"} onClick={() => navigate(`/tour/list`)}>
            투어 구경하기
            <FaArrowRight
              style={{
                display: "inline",
                marginLeft: "4px",
                marginTop: "-3px",
              }}
            />
          </button>
        </div>

        <div className={"index-tour-container-body"}>
          {isEmpty(tourList) ? (
            <div className={"empty-container"}>
              <p className={"empty-container-title"}>투어가 없습니다.</p>
              <p className={"empty-container-description"}>
                새로운 투어를 추가해보세요!
              </p>
            </div>
          ) : (
            <div className={"index-tour-container-card"}>
              {tourList.map((tour) => (
                <ul
                  key={tour.id}
                  onClick={() => navigate(`/tour/view/${tour.id}`)}
                >
                  <li className={"image"}>
                    <img src={tour.src} alt={"투어 사진"} />
                  </li>
                  <div className={"li-wrap"}>
                    <li className={"title"}>{tour.product}</li>
                    <li>{tour.title}</li>
                    <li>{tour.location}</li>
                    <li>{formatNumberWithCommas(tour.price)}원</li>
                  </div>
                </ul>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 커뮤니티 */}
      <section className={"index-community-container"}>
        <div className={"index-community-container-wrap"}>
          <div className={"index-community-container-header"}>
            <h1>커뮤니티</h1>
            <button
              className={"more-btn"}
              onClick={() => navigate(`/community/list`)}
            >
              다양한 여행 이야기를 들려주세요
              <FaArrowRight
                style={{
                  display: "inline",
                  marginLeft: "4px",
                  marginTop: "-3px",
                }}
              />
            </button>
          </div>

          <div className={"index-community-container-body"}>
            {isEmpty(communityList) ? (
              <div className={"empty-container"}>
                <p className={"empty-container-title"}>작성된 글이 없습니다.</p>
                <p className={"empty-container-description"}>
                  여러분의 다양한 여행 이야기를 들려주세요!
                </p>
              </div>
            ) : (
              <div className={"index-community-container-list"}>
                {communityList.map((community) => (
                  <ul
                    className={"list-item"}
                    key={community.id}
                    onClick={() => navigate(`/community/view/${community.id}`)}
                  >
                    <li>{community.title}</li>
                    <li>{community.writer}</li>
                  </ul>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className={"ad"}>
        <IndexSlider />
      </section>

      {/* 고객센터 */}
      <div className={"divided-container"}>
        <div className={"divided-container-wrap"}>
          <section className={"tel-container"}>
            <h3>마이트래블 고객센터</h3>
            <h5>1588-1111</h5>

            <ul>
              <li>&#10023; 평일: 09:00 ~ 18:00</li>
              <li>&#10023; 주말 / 공휴일 휴무</li>
            </ul>
          </section>

          <section className={"notice-section-wrap"}>
            <div className={"notice-section-header"}>
              <h1>공지사항</h1>
              <button
                className={"more-btn"}
                onClick={() => navigate(`/notice/list`)}
              >
                <FaPlus className={"pointer"} />
              </button>
            </div>

            <div className={"notice-section-body"}>
              {isEmpty(noticeList) ? (
                <div className={"empty-container"}>
                  <p className={"empty-container-title"}>
                    공지사항이 없습니다.
                  </p>
                </div>
              ) : (
                noticeList.map((notice) => (
                  <ul
                    className={"notice-section-list"}
                    key={notice.id}
                    onClick={() => navigate(`/notice/view/${notice.id}`)}
                  >
                    <li>
                      {notice.title.length > 25
                        ? `${notice.title.substring(0, 29)}...`
                        : notice.title}
                    </li>
                    <li>{notice.writer}</li>
                    <li>{formattedDate(notice.creationDate)}</li>
                  </ul>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
