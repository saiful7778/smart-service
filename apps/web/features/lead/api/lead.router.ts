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
import {
  leadCategoryCreateProcedure,
  listLeadCategoriesForSearchProcedure,
  listLeadCategoriesProcedure,
} from "./leadCategory.procedure";

export const leadRouter = leadImpl.router({
  list: listLeadProcedure,
  create: leadCreateProcedure,
  update: leadUpdateProcedure,
  details: leadDetailsProcedure,
  delete: leadDeleteProcedure,
  revenueHistory: leadRevenueHistoryProcedure,
  category: {
    list: listLeadCategoriesProcedure,
    listForSearch: listLeadCategoriesForSearchProcedure,
    create: leadCategoryCreateProcedure,
  },
  customer: {
    list: listCusotmerProcedure,
    listForSearch: listCustomerForSearchProcedure,
  },
});
