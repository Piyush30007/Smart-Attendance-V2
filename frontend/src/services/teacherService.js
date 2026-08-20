import api from "./api";

const teacherService = {
  list() {
    return api.get("/teachers");
  },

  create(data) {
    return api.post("/teachers", data);
  },

  update(id, data) {
    return api.put(`/teachers/${id}`, data);
  },

  remove(id) {
    return api.delete(`/teachers/${id}`);
  },
};

export default teacherService;