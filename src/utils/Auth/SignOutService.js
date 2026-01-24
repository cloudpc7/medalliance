// React Libraries and Modules
import { useCallback } from 'react';

// Redux Libraries and Modules
import { useDispatch, useSelector } from 'react-redux';
import { signOutUser } from '../../redux/slices/auth.slice';

export const useSignOut = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const handleSignOut = useCallback(() => {
    dispatch(signOutUser());
  }, [dispatch]);

  return { handleSignOut, loading };
};


