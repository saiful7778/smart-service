import {
  listMaterialsProcedure,
  materialCreateProcedure,
  materialImpl,
} from "./material.procedure";

export const materialRouter = materialImpl.router({
  list: listMaterialsProcedure,
  create: materialCreateProcedure,
});
