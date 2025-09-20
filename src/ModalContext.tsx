import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import "./Modal.css";

type FormData = {
  name: string;
  email: string;
  experience: string;
  github: string;
};

type ModalContextType = {
  openFormModal: (
    triggerElement?: HTMLElement | null
  ) => Promise<FormData | null>;
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
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(
    null
  );

  const openFormModal = (
    triggerEl?: HTMLElement | null
  ): Promise<FormData | null> => {
    return new Promise<FormData | null>((resolve) => {
      setTriggerElement(triggerEl || null);
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

    // 트리거 요소로 포커스 되돌리기
    if (triggerElement) {
      triggerElement.focus();
      setTriggerElement(null);
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

  const titleRef = useRef<HTMLHeadingElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // 모달이 열릴 때 애니메이션과 포커스 관리
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, 10);

    if (titleRef.current) {
      titleRef.current.focus();
    }

    return () => clearTimeout(timer);
  }, []);

  // ESC 키로 모달 닫기 + Tab 트랩
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
        return;
      }

      if (event.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
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

  // 배경 클릭으로 모달 닫기
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className={`modal-overlay ${isAnimating ? "modal-overlay--open" : ""}`}
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
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div
        ref={modalRef}
        className={`modal-content ${isAnimating ? "modal-content--open" : ""}`}
        style={{
          backgroundColor: "white",
          padding: "2rem",
          maxWidth: "500px",
          width: "90vw",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <h2 ref={titleRef} tabIndex={-1} id="modal-title">
          신청 폼
        </h2>
        <p id="modal-description">
          이메일과 FE 경력 연차 등 간단한 정보를 입력해주세요.
        </p>
        {/* 스크롤 테스트용 콘텐츠 */}
        <div style={{ marginTop: "2rem" }}>
          <h2>스크롤 테스트용 콘텐츠</h2>
          {Array.from({ length: 5 }, (_, i) => (
            <p key={i} style={{ margin: "1rem 0", lineHeight: "1.6" }}>
              {i + 1}. 이것은 스크롤 테스트를 위한 더미 콘텐츠입니다. 모달이
              열렸을 때 배경 스크롤이 막히는지 확인해보세요. Lorem ipsum dolor
              sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </p>
          ))}
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="name-input" style={{ display: "block" }}>
              이름 / 닉네임 *
            </label>
            <input
              id="name-input"
              type="text"
              {...register("name", {
                required: "이름을 입력해주세요",
                minLength: {
                  value: 2,
                  message: "이름은 2글자 이상이어야 합니다",
                },
              })}
              style={{ width: "100%" }}
              aria-invalid={errors.name ? "true" : "false"}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <div id="name-error" role="alert" aria-live="polite">
                {errors.name.message}
              </div>
            )}
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="email-input" style={{ display: "block" }}>
              이메일 *
            </label>
            <input
              id="email-input"
              type="email"
              {...register("email", {
                required: "이메일을 입력해주세요",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "올바른 이메일 형식을 입력해주세요",
                },
              })}
              style={{ width: "100%" }}
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <div id="email-error" role="alert" aria-live="polite">
                {errors.email.message}
              </div>
            )}
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="experience-select" style={{ display: "block" }}>
              FE 경력 연차 *
            </label>
            <select
              id="experience-select"
              {...register("experience", {
                required: "경력 연차를 선택해주세요",
              })}
              style={{ width: "100%" }}
              aria-invalid={errors.experience ? "true" : "false"}
              aria-describedby={
                errors.experience ? "experience-error" : undefined
              }
            >
              <option value="">선택해주세요</option>
              <option value="0-3년">0-3년</option>
              <option value="4-7년">4-7년</option>
              <option value="8년 이상">8년 이상</option>
            </select>
            {errors.experience && (
              <div id="experience-error" role="alert" aria-live="polite">
                {errors.experience.message}
              </div>
            )}
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="github-input" style={{ display: "block" }}>
              GitHub 링크 (선택)
            </label>
            <input
              id="github-input"
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
              aria-invalid={errors.github ? "true" : "false"}
              aria-describedby={errors.github ? "github-error" : undefined}
            />
            {errors.github && (
              <div id="github-error" role="alert" aria-live="polite">
                {errors.github.message}
              </div>
            )}
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
