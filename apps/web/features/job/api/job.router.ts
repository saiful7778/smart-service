import {
  jobAllDeleteProcedure,
  jobCreateProcedure,
  jobDataExportProcedure,
  jobDeleteProcedure,
  jobDetailsProcedure,
  jobImpl,
  jobUpdateProcedure,
  jobUpdateRevenueProcedure,
  listJobScheduleProcedure,
  listJobsProcedure,
} from "./job.procedure";
import { listJobAssignmentsProcedure } from "./jobAssignment.procedure";
import {
  jobAllRestoreProcedure,
  jobBinDeleteAllProcedure,
  jobBinDeleteProcedure,
  jobRestoreProcedure,
  listJobBinProcedure,
} from "./jobBin.procedure";

export const jobRouter = jobImpl.router({
  list: listJobsProcedure,
  listSchedule: listJobScheduleProcedure,
  export: jobDataExportProcedure,
  details: jobDetailsProcedure,
  create: jobCreateProcedure,
  update: jobUpdateProcedure,
  updateRevenue: jobUpdateRevenueProcedure,
  delete: jobDeleteProcedure,
  deleteAll: jobAllDeleteProcedure,
  bin: {
    list: listJobBinProcedure,
    restore: jobRestoreProcedure,
    restoreAll: jobAllRestoreProcedure,
    delete: jobBinDeleteProcedure,
    deleteAll: jobBinDeleteAllProcedure,
  },
  assignment: {
    list: listJobAssignmentsProcedure,
  },
});
