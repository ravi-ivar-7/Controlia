
import { useCallback } from 'react';
import addNotification from 'react-push-notification';

const defaultOptions = {
  title: 'Info',
  duration :'10000' ,
  theme: 'darkblue',
  position: 'top-left',
};

const useNotification = () => {
  const showNotification = useCallback((options) => {
    const mergedOptions = { ...defaultOptions, ...options };
    addNotification(mergedOptions);
  }, []);

  return { showNotification };
};

export default useNotification;
