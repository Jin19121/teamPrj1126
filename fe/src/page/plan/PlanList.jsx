import React, { useEffect, useState } from "react";
import { Center, HStack } from "@chakra-ui/react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "../../components/ui/pagination.jsx";
import "react-calendar/dist/Calendar.css";
import { FaRegQuestionCircle } from "react-icons/fa";
import "./Plan.css";
import Calendar from "react-calendar";
import { Modal } from "/src/components/root/Modal.jsx";
import { Breadcrumb } from "/src/components/root/Breadcrumb.jsx";
import { GoHeart, GoHeartFill } from "react-icons/go";
import { IoIosRefresh } from "react-icons/io";

function PlanList(props) {
  const [allPlans, setAllPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]); // 필터링된 일정
  const [selectedDate, setSelectedDate] = useState(null); // 선택된 날짜
  const [planList, setPlanList] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [search, setSearch] = useState({ type: "all", keyword: "" }); // 검색 정보 유지
  const [count, setCount] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // 달력에 표시 될 모든 일정 가져오기
  useEffect(() => {
    axios
      .get("/api/plan/all")
      .then((res) => res.data)
      .then((data) => {
        setAllPlans(data);
      });
  }, []);

  useEffect(() => {
    axios
      .get("/api/plan/list", {
        params: searchParams,
      })
      .then((res) => res.data)
      .then((data) => {
        setPlanList(data.list);
        setCount(data.count);
      });
  }, [searchParams]);

  // 선택된 날짜 필터링
  useEffect(() => {
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0]; // yyyy-MM-dd 형식
      const filtered = allPlans.filter((plan) => {
        if (!plan.startDate || !plan.endDate) return false; // 데이터 무결성 검증
        const startDate = new Date(plan.startDate);
        const endDate = new Date(plan.endDate);
        const targetDate = new Date(formattedDate);
        return targetDate >= startDate && targetDate <= endDate;
      });
      setFilteredPlans(filtered);
      setCount(filtered.length);
    } else {
      // 선택된 날짜가 없으면 페이지네이션 결과 보여줌
      setFilteredPlans(planList);
      setCount(allPlans.length);
    }
  }, [selectedDate, allPlans, planList]);

  // 선택된 날짜 업데이트
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  useEffect(() => {
    const nextSearch = { ...search };

    if (searchParams.get("st")) {
      nextSearch.type = searchParams.get("st");
    } else {
      nextSearch.type = "all";
    }

    if (searchParams.get("sk")) {
      nextSearch.keyword = searchParams.get("sk");
    } else {
      nextSearch.keyword = "";
    }

    setSearch(nextSearch);
  }, [searchParams]);

  // 엔터 키로 검색 실행
  function handleKeyPress(event) {
    if (event.key === "Enter") {
      handleSearchButton();
    }
  }

  const handlePinnedClick = (planId) => {
    axios.put(`/api/plan/pinned/${planId}`).then((res) => {
      // pinned 상태 업데이트
      const updatedPlanList = planList.map((plan) =>
        plan.id === planId ? { ...plan, pinned: !plan.pinned } : plan,
      );

      // pinned 상태가 변경된 후 updated, pinned 기준으로 정렬
      const sortedPlans = updatedPlanList.sort((a, b) => {
        // 먼저 pinned 상태가 true인 것이 우선
        if (b.pinned === a.pinned) {
          // pinned 상태가 같으면 updated 시간 기준으로 정렬
          return new Date(b.updated) - new Date(a.updated);
        }
        return b.pinned - a.pinned; // pinned 상태가 true인 것이 우선
      });

      setPlanList(sortedPlans);
    });
  };

  // search
  const handleSearchButton = () => {
    const nextSearchParam = new URLSearchParams(searchParams);

    if (search.keyword.trim().length > 0) {
      nextSearchParam.set("st", search.type);
      nextSearchParam.set("sk", search.keyword);
    } else {
      nextSearchParam.delete("st");
      nextSearchParam.delete("sk");
    }

    setSearchParams(nextSearchParam);
  };

  // pagination
  // page 번호 (searchParams : URL 쿼리 파라미터 관리)
  const pageParam = searchParams.get("page") ?? "1";
  // 문자열로 가져온 page 값을 숫자 타입으로 변환
  const page = Number(pageParam);

  // 페이지 번호 변경 시 URL 의 쿼리 파라미터를 업데이트
  function handlePageChange(e) {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("page", e.page);
    setSearchParams(nextSearchParams);
  }

  // 전체보기 버튼
  const handleShowAllPlans = () => {
    setFilteredPlans(filteredPlans);
    setSelectedDate(null);
    setSearchParams("");
  };

  return (
    <div className={"plan-wide"}>
      <Breadcrumb
        depth1={"내 여행"}
        navigateToDepth1={() => navigate(`/plan/list`)}
      />

      <div className={"calendar-list"}>
        <aside className={"calendar"}>
          <Calendar
            formatDay={(locale, date) =>
              date.toLocaleString("en", { day: "numeric" })
            }
            showNeighboringMonth={false}
            next2Label={null}
            prev2Label={null}
            onChange={handleDateChange} // 날짜 선택 이벤트 핸들러
            value={selectedDate} // 선택된 날짜 상태와 동기화
            // 여행이 있는 날짜에 스타일 적용
            tileContent={({ date }) => {
              const formattedDate = date.toISOString().split("T")[0];

              // 선택된 날짜에 해당하는 여행의 title을 찾아서 표시
              const matchingPlan = allPlans.find(
                (plan) =>
                  formattedDate >= plan.startDate &&
                  formattedDate <= plan.endDate,
              );

              return matchingPlan ? (
                <div className={"calendar-badge"}>{matchingPlan.title}</div>
              ) : null;
            }}
          />
        </aside>

        <div className={"day-list"}>
          <div className={"fixed-list-head-wrap"}>
            <div className={"btn-wrap"}>
              <button
                className="btn btn-dark"
                onClick={() => setAddModalOpen(true)}
              >
                새로운 여행 작성하기
              </button>

              <button
                className="btn btn-dark-outline"
                onClick={handleShowAllPlans}
              >
                전체 보기
              </button>
            </div>

            <div className={"search-form"}>
              <button
                onClick={() => {
                  // 1. 검색 상태 초기화
                  setSearch({ type: "all", keyword: "" });

                  // 2. URL 검색 파라미터 초기화
                  const nextSearchParam = new URLSearchParams();
                  nextSearchParam.set("type", "all");
                  nextSearchParam.set("key", "");

                  setSearchParams(nextSearchParam);
                }}
                style={{ marginRight: "10px", cursor: "pointer" }}
              >
                <IoIosRefresh />
              </button>

              <select
                onChange={(e) => setSearch({ ...search, type: e.target.value })}
              >
                <option value="all">전체</option>
                <option value="title">여행명</option>
                <option value="destination">여행지</option>
              </select>

              <div className={"search-form-input"}>
                <input
                  type="search"
                  placeholder={"내 여행을 검색해보세요."}
                  value={search.keyword}
                  onChange={(e) =>
                    setSearch({ ...search, keyword: e.target.value.trim() })
                  }
                  onKeyPress={handleKeyPress}
                />
                <button
                  className={"btn-search btn-dark"}
                  onClick={handleSearchButton}
                >
                  검색
                </button>
              </div>
            </div>
          </div>

          <div className={"plan-list-wrap"}>
            {filteredPlans.length === 0 ? (
              <div className={"empty-container"}>
                <p>
                  <FaRegQuestionCircle
                    className={"empty-container-icon"}
                    style={{ color: "#a1a1a8" }}
                  />
                </p>
                <p className={"empty-container-title"}>
                  해당하는 날짜에는 일정이 없습니다.
                </p>
                <p className={"empty-container-description"}>
                  다른 날짜를 선택해주세요.
                </p>
              </div>
            ) : (
              filteredPlans.map((plan) => (
                <div
                  className={"card-wrap"}
                  key={plan.id}
                  onClick={() => {
                    navigate(`/plan/view/${plan.id}`);
                  }}
                >
                  <div className={"card-header"}>
                    <p>{plan.title}</p>
                    <p
                      className={"pinned"}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePinnedClick(plan.id);
                      }}
                    >
                      {plan.pinned ? (
                        <GoHeartFill style={{ color: "red" }} />
                      ) : (
                        <GoHeart />
                      )}
                    </p>
                  </div>

                  <div className={"card-body"}>
                    <p>{plan.description}</p>
                  </div>

                  <div className={"card-footer"}>
                    <ul>
                      {planList.destination ? (
                        <li>{plan.destination}</li>
                      ) : null}

                      {plan.startDate && plan.endDate ? (
                        <li>
                          {plan.startDate} ~ {plan.endDate}
                        </li>
                      ) : null}
                    </ul>
                  </div>
                </div>
              ))
            )}

            {/* pagination */}
            <div className="pagination">
              <Center>
                <PaginationRoot
                  onPageChange={handlePageChange}
                  count={count}
                  pageSize={10}
                  page={page}
                  variant="solid"
                >
                  <HStack>
                    <PaginationPrevTrigger />
                    <PaginationItems />
                    <PaginationNextTrigger />
                  </HStack>
                </PaginationRoot>
              </Center>
            </div>
          </div>
        </div>

        {/* 추가 modal */}
        <Modal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onConfirm={() => {
            navigate(`/plan/add`);
            window.scrollTo(0, 0);
          }}
          message="새로운 여행을 작성하시겠습니까?"
          buttonMessage="작성"
        />
      </div>
    </div>
  );
}

export default PlanList;
