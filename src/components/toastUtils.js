import { toast } from 'react-toastify';
import { CheckCircle, Error, Info, Warning } from '@mui/icons-material';

export const showSuccessToast = (message) => {
  toast.success(message, {
    icon: <CheckCircle style={{ color: 'white', fontSize: '24px', marginRight: '12px' }} />,
    style: {
      background: '#4CAF50',
      color: 'white',
      borderLeft: '4px solid #81C784',
    },
  });
};

export const showErrorToast = (message) => {
  toast.error(message, {
    icon: <Error style={{ color: 'white', fontSize: '24px', marginRight: '12px' }} />,
    style: {
      background: '#F44336',
      color: 'white',
      borderLeft: '4px solid #E57373',
    },
  });
};

export const showWarningToast = (message) => {
  toast.warning(message, {
    icon: <Warning style={{ color: 'white', fontSize: '24px', marginRight: '12px' }} />,
    style: {
      background: '#FF9800',
      color: 'white',
      borderLeft: '4px solid #FFB74D',
    },
  });
};

export const showInfoToast = (message) => {
  toast.info(message, {
    icon: <Info style={{ color: 'white', fontSize: '24px', marginRight: '12px' }} />,
    style: {
      background: '#2196F3',
      color: 'white',
      borderLeft: '4px solid #64B5F6',
    },
  });
};