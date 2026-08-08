import { useSelector, useDispatch } from "react-redux";
import { signInUser, signUpUser, signOutUser, checkSession, clearError } from "../store/slices/authSlice";
import { useCallback } from "react";

export function useAuth() {
  const dispatch = useDispatch();
  const { user, session, loading, error } = useSelector((state) => state.auth);

  const login = useCallback(
    async (username, password) => {
      const result = await dispatch(signInUser({ username, password }));
      return result;
    },
    [dispatch]
  );

  const register = useCallback(
    async (username, password) => {
      const result = await dispatch(signUpUser({ username, password }));
      return result;
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    const result = await dispatch(signOutUser());
    return result;
  }, [dispatch]);

  const initAuth = useCallback(async () => {
    const result = await dispatch(checkSession());
    return result;
  }, [dispatch]);

  const resetError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    session,
    loading,
    error,
    login,
    register,
    logout,
    initAuth,
    resetError,
  };
}

export default useAuth;
