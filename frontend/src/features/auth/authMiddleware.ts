import { authApi } from "./authApi";
import { logout } from "./authSlice";

export const authMiddleware =
  (store: { dispatch: Function }) => (next: Function) => (action: any) => {
    if (
      // authApi.endpoints.getCurrentUser.matchRejected(action) &&
      action.payload?.status === 401
    ) {
      store.dispatch(logout());
    } else {
      return next(action);
    }
  };
