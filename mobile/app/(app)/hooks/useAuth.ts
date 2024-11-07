import { useTranslation } from 'react-i18next';
import { useSessionContext } from '../../SessionContext';
import { useUserContext } from '../context/UserContext';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { ErrorType, getMessageForErrorType } from '../utils/errorHandler';

export const useAuth = () => {
  const sessionContext = useSessionContext();
  const { t } = useTranslation();
  const userContext = useUserContext();

  useEffect(() => {
    if (!sessionContext.session || !userContext.data) {
      sessionContext.setAuthError(getMessageForErrorType(t, ErrorType.UNAUTHORIZED_ACCESS));
      sessionContext.signOut();
      router.replace('/login');
    }
  }, []);

  return sessionContext;
};
