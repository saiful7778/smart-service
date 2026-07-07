import {
  listCusotmerProcedure,
  listCustomerForSearchProcedure,
} from "./customer.procedure";
import {
  leadCreateProcedure,
  leadDeleteProcedure,
  leadDetailsProcedure,
  leadImpl,
  leadRevenueHistoryProcedure,
  leadUpdateProcedure,
  listLeadProcedure,
} from "./lead.procedure";
import { listLeadCategoriesProcedure } from "./leadCategory.procedure";

export const leadRouter = leadImpl.router({
  list: listLeadProcedure,
  create: leadCreateProcedure,
  update: leadUpdateProcedure,
  details: leadDetailsProcedure,
  delete: leadDeleteProcedure,
  revenueHistory: leadRevenueHistoryProcedure,
  category: {
    list: listLeadCategoriesProcedure,
  },
  customer: {
    list: listCusotmerProcedure,
    listForSearch: listCustomerForSearchProcedure,
  },
});
