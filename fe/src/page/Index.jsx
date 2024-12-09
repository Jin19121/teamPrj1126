import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Index.css";
import { IoSearch } from "react-icons/io5";

export function Index() {
  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [planList, setPlanList] = useState([]); // Plan 리스트 상태
  const [tourList, setTourList] = useState([]); // Tour 리스트 상태
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/api/index")
      .then((res) => {
        setPlanList(res.data.plans);
        setTourList(res.data.tours);
      })
      .catch((error) => {
        console.error("Error fetching index data:", error);
      });
  }, []);

  useEffect(() => {
    const nextSearch = { ...search };

    if (searchParams.get("keyword")) {
      nextSearch.keyword = searchParams.get("keyword");
    } else {
      nextSearch.keyword = "";
    }
    setSearch(nextSearch);
  }, [searchParams]);

  const isEmpty = (list) => {
    return list.length === 0;
  };

  function handleSearchButton() {
    const nextSearchParam = new URLSearchParams(searchParams);

    if (search.keyword.trim().length > 0) {
      // 검색
      nextSearchParam.set("keyword", search.keyword);

      setSearchParams(nextSearchParam);
    } else {
      // 검색 안 함
      nextSearchParam.delete("keyword");

      setSearchParams(nextSearchParam);
    }
  }

  return (
    <div className={"body-wide"}>
      {/* 검색 영역 */}
      <section className={"main-search-wrap"}>
        <input
          type="search"
          placeholder={"어디로 떠나고 싶은가요?"}
          value={search.keyword}
          onChange={(e) =>
            setSearch({ ...search, keyword: e.target.value.trim() })
          }
        />
        <button className={"main-search-wrap-btn"} onClick={handleSearchButton}>
          <IoSearch />
        </button>
      </section>

      {/* 내 여행 섹션 */}
      <section className={"main-section-wrap"}>
        <div className={"section-header"}>
          <h2>내 여행</h2>
          <button className={"more-btn"} onClick={() => navigate(`/plan/list`)}>
            더보기
          </button>
        </div>

        <div className={"section-body"}>
          {isEmpty(planList) ? (
            <div className={"empty-container"}>
              <p className={"empty-container-title"}>여행 계획이 없습니다.</p>
              <p className={"empty-container-description"}>
                새로운 계획을 추가해보세요!
              </p>
            </div>
          ) : (
            <ul className={"section-body-list"}>
              {planList.map((plan) => (
                <li
                  key={plan.id}
                  onClick={() => navigate(`/plan/view/${plan.id}`)}
                >
                  <h3>{plan.title}</h3>
                  <ul className={"list-item"}>
                    <li className={"description"}>{plan.description}</li>
                    <li className={"location"}>{plan.destination}</li>
                    <li className={"period"}>
                      {plan.startDate} ~ {plan.endDate}
                    </li>
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* 투어 섹션 */}
      <section className={"main-section-wrap"}>
        <div className={"section-header"}>
          <h2>투어 목록</h2>
          <button className={"more-btn"} onClick={() => navigate(`/tour/list`)}>
            더보기
          </button>
        </div>

        <div className={"section-body"}>
          {isEmpty(planList) ? (
            <div className={"empty-container"}>
              <p className={"empty-container-title"}>투어가 없습니다.</p>
              <p className={"empty-container-description"}>
                새로운 투어를 추가해보세요!
              </p>
            </div>
          ) : (
            <ul className={"section-body-list"}>
              {tourList.map((tour) => (
                <li
                  key={tour.id}
                  onClick={() => navigate(`/tour/view/${tour.id}`)}
                >
                  <h3>{tour.product}</h3>
                  <ul className={"list-item"}>
                    <li className={"description"}>{tour.title}</li>
                    <li className={"location"}>{tour.location}</li>
                    <li className={"price"}>{tour.price}</li>
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* 커뮤니티 섹션 */}
      <section className={"main-section-wrap"}>
        <div className={"section-header"}>
          <h2>커뮤니티</h2>
          <button className={"more-btn"} onClick={() => navigate(`/plan/list`)}>
            더보기
          </button>
        </div>

        <div className={"section-body"}>
          {isEmpty(planList) ? (
            <div className={"empty-container"}>
              <p className={"empty-container-title"}>여행 계획이 없습니다.</p>
              <p className={"empty-container-description"}>
                새로운 계획을 추가해보세요!
              </p>
            </div>
          ) : (
            <ul className={"section-body-list"}>
              {planList.map((plan) => (
                <li
                  key={plan.id}
                  onClick={() => navigate(`/plan/view/${plan.id}`)}
                >
                  <h3>{plan.title}</h3>
                  <ul className={"list-item"}>
                    <li className={"description"}>{plan.description}</li>
                    <li className={"location"}>{plan.destination}</li>
                    <li className={"period"}>
                      {plan.startDate} ~ {plan.endDate}
                    </li>
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
