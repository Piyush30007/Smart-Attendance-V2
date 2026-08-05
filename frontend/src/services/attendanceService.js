import { attendanceApi } from "./api";

const attendanceService = {
  list: attendanceApi.list,
  mark: attendanceApi.mark,
  report: attendanceApi.report,
};

export default attendanceService;
