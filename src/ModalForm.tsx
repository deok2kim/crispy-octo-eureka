import { useModal } from "./ModalContext";
import { useRef } from "react";

export default function ModalForm() {
  const { openFormModal } = useModal();
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  const handleOpenModal = async () => {
    const result = await openFormModal(triggerButtonRef.current);

    console.log(result);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <button ref={triggerButtonRef} onClick={handleOpenModal}>
        🚀 신청 폼 작성하기
      </button>

      {/* 스크롤 테스트용 콘텐츠 */}
      <div style={{ marginTop: "2rem" }}>
        <h2>스크롤 테스트용 콘텐츠</h2>
        {Array.from({ length: 20 }, (_, i) => (
          <p key={i} style={{ margin: "1rem 0", lineHeight: "1.6" }}>
            {i + 1}. 이것은 스크롤 테스트를 위한 더미 콘텐츠입니다. 모달이
            열렸을 때 배경 스크롤이 막히는지 확인해보세요. Lorem ipsum dolor sit
            amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
            ut labore et dolore magna aliqua.
          </p>
        ))}
      </div>
    </div>
  );
}
