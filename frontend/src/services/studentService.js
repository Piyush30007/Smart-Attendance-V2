import api from "./api";

const studentService = {
  list() {
    return api.get("/students");
  },

  create(data) {
    return api.post("/students", data);
  },

  remove(id) {
    return api.delete(`/students/${id}`);
  },
};

export default studentService;