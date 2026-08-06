import api from "./api";

const attendanceService = {
  list(studentId) {
    return api.get("/attendance", {
      params: { student_id: studentId },
    });
  },

  mark(imageBase64) {
    return api.post("/attendance/mark", {
      image_base64: imageBase64,
    });
  },

  report(startDate, endDate) {
    return api.get("/attendance/report", {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    });
  },
};

export default attendanceService;