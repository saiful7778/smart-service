import {
  jobCreateProcedure,
  jobDeleteProcedure,
  jobDetailsProcedure,
  jobImpl,
  jobUpdateProcedure,
  jobUpdateRevenueProcedure,
  listJobsProcedure,
  listServicingsProcedure,
} from "./job.procedure";

export const jobRouter = jobImpl.router({
  list: listJobsProcedure,
  listServicings: listServicingsProcedure,
  details: jobDetailsProcedure,
  create: jobCreateProcedure,
  update: jobUpdateProcedure,
  updateRevenue: jobUpdateRevenueProcedure,
  delete: jobDeleteProcedure,
});
