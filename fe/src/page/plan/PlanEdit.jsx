import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Spinner } from "@chakra-ui/react";

function PlanEdit(props) {
  const { id } = useParams();
  const [backToListModalOpen, setBackToListModalOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [plan, setPlan] = useState({
    title: "",
    description: "",
    destination: "",
    due: "",
  });
  const [planFields, setPlanFields] = useState([
    {
      date: "",
      time: "",
      schedule: "",
      place: "",
      memo: "",
    },
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/api/plan/view/${id}`).then((res) => {
      setPlan(res.data.plan);
      setPlanFields(res.data.planFields);
    });
  }, []);

  if (plan === null) {
    return <Spinner />;
  }

  // field 입력값을 상태로 업데이트하는 함수
  const handleFieldChange = (index, field, value) => {
    const updatedFields = [...planFields];
    updatedFields[index][field] = value;
    setPlanFields(updatedFields);
  };

  // + 버튼 클릭 시 새로운 필드 추가
  function handleAddField() {
    setPlanFields([
      ...planFields,
      {
        date: "",
        time: "",
        schedule: "",
        place: "",
        memo: "",
      },
    ]);
  }

  // - 버튼 클릭 시 필드 삭제
  function handleDeleteField(index) {
    setPlanFields(planFields.filter((_, i) => i !== index));
  }

  // 저장 폼 제출 처리 함수
  function handleSaveButton() {
    axios
      .put("/api/plan/update", {
        id: id,
        title: plan.title,
        description: plan.description,
        destination: plan.destination,
        due: plan.due,
        planFieldList: planFields, // 필드 배열을 그대로 전달
      })
      .then((res) => navigate(`/plan/view/${id}`))
      .then(() => alert("일정이 수정되었습니다."))
      .catch((error) => alert("수정에 실패했습니다."))
      .finally();
  }

  const closeModal = () => {
    setBackToListModalOpen(false);
    setSaveModalOpen(false);
  };

  return (
    <div className={"body"}>
      <div className={"btn-wrap"}>
        <button
          className={"btn btn-dark-outline"}
          onClick={setBackToListModalOpen}
        >
          목록
        </button>

        <button className={"btn btn-dark"} onClick={setSaveModalOpen}>
          저장
        </button>
      </div>

      <h1>일정 수정</h1>

      <form className={"plan-container"}>
        <fieldset className={"plan-header"}>
          <ul className={"title"}>
            <li>
              <label htmlFor="title">여행명</label>
              <input
                type="text"
                id="name"
                size="20"
                value={plan.title}
                onChange={(e) => setPlan({ ...plan, title: e.target.value })}
              />
            </li>

            <li>
              <label htmlFor="description">설명</label>
              <input
                type="text"
                id="description"
                size="50"
                value={plan.description}
                onChange={(e) =>
                  setPlan({ ...plan, description: e.target.value })
                }
              />
            </li>
          </ul>

          <ul className={"sub-title"}>
            <li>
              <label htmlFor="destination">여행지</label>
              <input
                type="text"
                id="destination"
                size="20"
                placeholder="어디로 떠나시나요?"
                value={plan.destination}
                onChange={
                  (e) => setPlan({ ...plan, destination: e.target.value }) // plan.destination만 변경
                }
              />
            </li>

            <li>
              <label htmlFor="due">기간</label>
              <input
                id="due"
                value={plan.due}
                onChange={(e) => setPlan({ ...plan, due: e.target.value })}
              />
            </li>
          </ul>
        </fieldset>

        <fieldset className={"plan-body"}>
          {planFields.map((field, index) => (
            <div key={index}>
              <label htmlFor="date">날짜</label>
              <input
                name="date"
                type="date"
                value={field.date}
                onChange={(e) =>
                  handleFieldChange(index, "date", e.target.value)
                }
              />

              <label htmlFor="time">시간</label>
              <input
                name="time"
                type="time"
                value={field.time}
                onChange={(e) =>
                  handleFieldChange(index, "time", e.target.value)
                }
              />

              <label htmlFor="schedule">일정명</label>
              <input
                name="schedule"
                value={field.schedule}
                onChange={(e) =>
                  handleFieldChange(index, "schedule", e.target.value)
                }
              />

              <label htmlFor="location">장소</label>
              <input
                name="location"
                value={field.place}
                onChange={(e) =>
                  handleFieldChange(index, "place", e.target.value)
                }
              />

              <label htmlFor="memo">메모</label>
              <textarea
                name="memo"
                value={field.memo}
                onChange={(e) =>
                  handleFieldChange(index, "memo", e.target.value)
                }
              />

              <div className={"btn-wrap"}>
                <button
                  className={"btn btn-dark"}
                  type="button"
                  onClick={handleAddField}
                >
                  +
                </button>
                <button
                  className={"btn btn-dark"}
                  type="button"
                  onClick={() => handleDeleteField(index)}
                >
                  -
                </button>
              </div>
            </div>
          ))}
        </fieldset>
      </form>

      {/* 목록 modal */}
      {backToListModalOpen && (
        <div className={"modal"}>
          <div className={"modal-content"}>
            <div className={"modal-header"}>
              <a href="#" className={"close"} onClick={closeModal}>
                &times;
              </a>
            </div>

            <div className={"modal-body"}>
              <p>목록으로 돌아가시겠습니까?</p>
            </div>

            <div className={"modal-footer btn-wrap"}>
              <button className={"btn btn-dark-outline"} onClick={closeModal}>
                닫기
              </button>

              <button
                className={"btn btn-dark"}
                onClick={() => navigate(`/plan/list`)}
              >
                목록
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 저장 modal */}
      {saveModalOpen && (
        <div className={"modal"}>
          <div className={"modal-content"}>
            <div className={"modal-header"}>
              <a href="#" className={"close"} onClick={closeModal}>
                &times;
              </a>
            </div>

            <div className={"modal-body"}>
              <p>여행을 저장하시겠습니까?</p>
            </div>

            <div className={"modal-footer btn-wrap"}>
              <button className={"btn btn-dark-outline"} onClick={closeModal}>
                닫기
              </button>

              <button className={"btn btn-dark"} onClick={handleSaveButton}>
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlanEdit;