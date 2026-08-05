import { authApi } from "./api";

const authService = {
  login: authApi.login,
  signup: authApi.signup,
};

export default authService;
