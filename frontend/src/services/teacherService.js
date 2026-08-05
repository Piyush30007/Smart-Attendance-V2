import api from "./api";

const teacherService = {
  list: () => api.get("/teachers"),
};

export default teacherService;
