import { studentApi } from "./api";

const studentService = {
  list: studentApi.list,
  create: studentApi.create,
  remove: studentApi.remove,
};

export default studentService;
