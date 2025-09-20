import { useModal } from "./ModalContext";

type FormData = {
  name: string;
  email: string;
  experience: string;
  github: string;
};

export default function ModalForm() {
  const { openFormModal } = useModal();

  const handleOpenModal = async () => {
    const result = await openFormModal<FormData>();

    console.log(result);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <button onClick={handleOpenModal}>🚀 신청 폼 작성하기</button>
    </div>
  );
}
