import {
  listMaterialsProcedure,
  materialCreateProcedure,
  materialDeleteProcedure,
  materialDetailsProcedure,
  materialImpl,
  materialUpdateProcedure,
} from "./material.procedure";

export const materialRouter = materialImpl.router({
  list: listMaterialsProcedure,
  details: materialDetailsProcedure,
  create: materialCreateProcedure,
  update: materialUpdateProcedure,
  delete: materialDeleteProcedure,
});
