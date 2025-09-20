import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";

type FormData = {
  name: string;
  email: string;
  experience: string;
  github: string;
};

type ModalContextType = {
  openFormModal: () => Promise<FormData | null>;
};

const ModalContext = createContext<ModalContextType | null>(null);

type ModalProviderProps = {
  children: ReactNode;
};

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [resolvePromise, setResolvePromise] = useState<
    ((value: FormData | null) => void) | null
  >(null);

  const openFormModal = (): Promise<FormData | null> => {
    return new Promise<FormData | null>((resolve) => {
      setResolvePromise(() => resolve);
      setIsOpen(true);
    });
  };

  const closeModal = (result: FormData | null = null) => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(result);
      setResolvePromise(null);
    }
  };

  const handleSubmit = (formData: FormData) => {
    closeModal(formData);
  };

  const handleCancel = () => {
    closeModal(null);
  };

  return (
    <ModalContext.Provider value={{ openFormModal }}>
      {children}
      {isOpen && <FormModal onSubmit={handleSubmit} onCancel={handleCancel} />}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

type FormModalProps = {
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
};

const FormModal: React.FC<FormModalProps> = ({ onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel]);

  // 배경 스크롤 방지
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body);
    const originalOverflow = originalStyle.overflow;
    const originalPaddingRight = originalStyle.paddingRight;

    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollBarWidth}px`;

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, []);

  const onFormSubmit = (data: FormData) => {
    onSubmit(data);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          maxWidth: "500px",
          maxHeight: "80vh",
          overflow: "auto",
        }}
      >
        <h2>신청 폼</h2>
        <p>이메일과 FE 경력 연차 등 간단한 정보를 입력해주세요.</p>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block" }}>이름 / 닉네임 *</label>
            <input
              type="text"
              {...register("name", {
                required: "이름을 입력해주세요",
                minLength: {
                  value: 2,
                  message: "이름은 2글자 이상이어야 합니다",
                },
              })}
              style={{ width: "100%" }}
            />
            {errors.name && <div>{errors.name.message}</div>}
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block" }}>이메일 *</label>
            <input
              type="email"
              {...register("email", {
                required: "이메일을 입력해주세요",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "올바른 이메일 형식을 입력해주세요",
                },
              })}
              style={{ width: "100%" }}
            />
            {errors.email && <div>{errors.email.message}</div>}
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block" }}>FE 경력 연차 *</label>
            <select
              {...register("experience", {
                required: "경력 연차를 선택해주세요",
              })}
              style={{ width: "100%" }}
            >
              <option value="">선택해주세요</option>
              <option value="0-3년">0-3년</option>
              <option value="4-7년">4-7년</option>
              <option value="8년 이상">8년 이상</option>
            </select>
            {errors.experience && <div>{errors.experience.message}</div>}
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block" }}>GitHub 링크 (선택)</label>
            <input
              type="url"
              {...register("github", {
                pattern: {
                  value: /^https?:\/\/.+/,
                  message:
                    "올바른 URL 형식을 입력해주세요 (http:// 또는 https://로 시작)",
                },
              })}
              style={{ width: "100%" }}
              placeholder="https://github.com/username"
            />
            {errors.github && <div>{errors.github.message}</div>}
          </div>

          <div>
            <button type="button" onClick={onCancel}>
              취소
            </button>
            <button type="submit">제출</button>
          </div>
        </form>
      </div>
    </div>
  );
};
