import { toast } from "react-hot-toast";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

const useToast = () => {
  const showToast = (message, options = {}) => {
    return toast(message, options);
  };

  const dismissToast = (toastId) => {
    toast.dismiss(toastId);
  };

  const showSuccessToast = (message, options = {}) => {
    return toast.success(message, { ...options, icon: <FaCheckCircle style={{ color: 'green' }} /> });
  };

  const showErrorToast = (message, options = {}) => {
    return toast.error(message, { ...options, icon: <FaExclamationCircle style={{ color: 'red' }} /> });
  };

  const showInfoToast = (message, options = {}) => {
    return toast(message, { ...options, icon: <FaInfoCircle style={{ color: 'blue' }} /> });
  };

  const showWarningToast = (message, options = {}) => {
    return toast(message, { ...options, icon: <FaExclamationTriangle style={{ color: 'orange' }} /> });
  };

  return {
    showToast,
    dismissToast,
    showSuccessToast,
    showErrorToast,
    showInfoToast,
    showWarningToast,
  };
};

export default useToast;
