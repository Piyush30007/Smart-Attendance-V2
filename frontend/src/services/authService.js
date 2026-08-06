import api from "./api";

const authService = {
  login(username, password) {
    const formData = new URLSearchParams();

    formData.append("username", username);
    formData.append("password", password);

    return api.post("/auth/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  },

  signup(data) {
    return api.post("/auth/signup", data);
  },
};

export default authService;