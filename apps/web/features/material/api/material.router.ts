import { listMaterialsProcedure, materialImpl } from "./material.procedure";

export const materialRouter = materialImpl.router({
  list: listMaterialsProcedure,
});
