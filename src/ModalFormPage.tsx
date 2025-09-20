import { ModalProvider } from "./ModalContext";
import ModalForm from "./ModalForm";

const ModalFormPage = () => {
  return (
    <ModalProvider>
      <ModalForm />
    </ModalProvider>
  );
};

export default ModalFormPage;
