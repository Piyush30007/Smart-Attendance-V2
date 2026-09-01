import api from "./api";

const studentService = {
  list() {
    return api.get("/students");
  },

  create(data) {
    return api.post("/students", data);
  },
  update(id ,data){
    return api.put(`/students/${id}`,data);
  },
  remove(id) {
    return api.delete(`/students/${id}`);
  },
  registerFace(studentId , imageBase64)
{
  return api.post(`/students/${studentId}/register-face` , {image_base64 : imageBase64});
}
};

export default studentService;