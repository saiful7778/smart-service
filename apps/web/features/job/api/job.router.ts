import {
  jobAllDeleteProcedure,
  jobCreateProcedure,
  jobDeleteProcedure,
  jobDetailsProcedure,
  jobImpl,
  jobUpdateProcedure,
  jobUpdateRevenueProcedure,
  listJobsProcedure,
  listServicingsProcedure,
} from "./job.procedure";
import {
  jobAllRestoreProcedure,
  jobBinDeleteAllProcedure,
  jobBinDeleteProcedure,
  jobRestoreProcedure,
  listJobBinProcedure,
} from "./jobBin.procedure";

export const jobRouter = jobImpl.router({
  list: listJobsProcedure,
  listServicings: listServicingsProcedure,
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
});
