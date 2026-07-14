import {
  listMaterialsProcedure,
  materialCreateProcedure,
  materialDeleteProcedure,
  materialImpl,
  materialUpdateProcedure,
} from "./material.procedure";

export const materialRouter = materialImpl.router({
  list: listMaterialsProcedure,
  create: materialCreateProcedure,
  update: materialUpdateProcedure,
  delete: materialDeleteProcedure,
});
