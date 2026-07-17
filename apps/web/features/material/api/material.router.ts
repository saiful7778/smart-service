import {
  listMaterialsProcedure,
  materialAllDeleteProcedure,
  materialCreateProcedure,
  materialDeleteProcedure,
  materialDetailsProcedure,
  materialImpl,
  materialUpdateProcedure,
} from "./material.procedure";
import {
  listMaterialBinProcedure,
  materialAllRestoreProcedure,
  materialBinDeleteAllProcedure,
  materialBinDeleteProcedure,
  materialRestoreProcedure,
} from "./materialBin.procedure";

export const materialRouter = materialImpl.router({
  list: listMaterialsProcedure,
  details: materialDetailsProcedure,
  create: materialCreateProcedure,
  update: materialUpdateProcedure,
  delete: materialDeleteProcedure,
  deleteAll: materialAllDeleteProcedure,
  bin: {
    list: listMaterialBinProcedure,
    restore: materialRestoreProcedure,
    restoreAll: materialAllRestoreProcedure,
    delete: materialBinDeleteProcedure,
    deleteAll: materialBinDeleteAllProcedure,
  },
});
