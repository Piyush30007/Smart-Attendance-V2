import api from "./api";

const authService = {

  login(username, password) {

    return api.post("/auth/login", {
      username_or_email: username,
      password: password,
    });

  },

  signup(data) {

    return api.post("/auth/signup", data);

  },

  googleLogin(credential, role, inviteCode, mode) {

    const data = {
      credential,
      mode,
    };

    if (mode === "signup") {

      data.role = role;
      data.invite_code = inviteCode;

    }

    return api.post("/auth/google", data);

  },

};

export default authService;