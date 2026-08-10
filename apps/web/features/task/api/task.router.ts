import {
  listOrgTasksProcedure,
  orgTaskCreateProcedure,
  orgTaskDeleteProcedure,
  orgTaskDetailsProcedure,
  orgTaskUpdateProcedure,
} from "./orgTask.procedure";
import {
  listTasksProcedure,
  taskCreateProcedure,
  taskDeleteProcedure,
  taskDetailsProcedure,
  taskImpl,
  taskUpdateProcedure,
} from "./task.procedure";

export const taskRouter = taskImpl.router({
  list: listTasksProcedure,
  details: taskDetailsProcedure,
  create: taskCreateProcedure,
  update: taskUpdateProcedure,
  delete: taskDeleteProcedure,
  org: {
    list: listOrgTasksProcedure,
    details: orgTaskDetailsProcedure,
    create: orgTaskCreateProcedure,
    update: orgTaskUpdateProcedure,
    delete: orgTaskDeleteProcedure,
  },
});
