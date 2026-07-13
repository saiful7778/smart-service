import {
  listCusotmerProcedure,
  listCustomerForSearchProcedure,
} from "./customer.procedure";
import {
  leadAddressUpdateProcedure,
  leadAllDeleteProcedure,
  leadCreateProcedure,
  leadDeleteProcedure,
  leadDetailsProcedure,
  leadImpl,
  leadRevenueHistoryProcedure,
  leadUpdateProcedure,
  listLeadForSearchProcedure,
  listLeadProcedure,
} from "./lead.procedure";
import {
  leadAttachmentCreateProcedure,
  leadAttachmentDeleteProcedure,
  listLeadAttachmentProcedure,
} from "./leadAttachment.procedure";
import {
  leadAttachmentBinDeleteProcedure,
  leadAttachmentRestoreProcedure,
  listLeadAttachmentBinProcedure,
} from "./leadAttachmentBin.procedure";
import {
  leadAllRestoreProcedure,
  leadBinDeleteAllProcedure,
  leadBinDeleteProcedure,
  leadRestoreProcedure,
  listLeadBinProcedure,
} from "./leadBin.procedure";
import {
  leadCategoryCreateProcedure,
  listLeadCategoriesForSearchProcedure,
  listLeadCategoriesProcedure,
} from "./leadCategory.procedure";
import { listLeadJobsProcedure } from "./leadJob.procedure";
import {
  leadNoteCreateProcedure,
  leadNoteDeleteProcedure,
  leadNoteUpdateProcedure,
  listLeadNotesProcedure,
} from "./leadNote.procedure";

export const leadRouter = leadImpl.router({
  list: listLeadProcedure,
  listForSearch: listLeadForSearchProcedure,
  create: leadCreateProcedure,
  update: leadUpdateProcedure,
  updateAddress: leadAddressUpdateProcedure,
  details: leadDetailsProcedure,
  delete: leadDeleteProcedure,
  deleteAll: leadAllDeleteProcedure,
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
  note: {
    list: listLeadNotesProcedure,
    create: leadNoteCreateProcedure,
    update: leadNoteUpdateProcedure,
    delete: leadNoteDeleteProcedure,
  },
  job: {
    list: listLeadJobsProcedure,
  },
  attachment: {
    list: listLeadAttachmentProcedure,
    create: leadAttachmentCreateProcedure,
    delete: leadAttachmentDeleteProcedure,
    bin: {
      list: listLeadAttachmentBinProcedure,
      delete: leadAttachmentBinDeleteProcedure,
      restore: leadAttachmentRestoreProcedure,
    },
  },
  bin: {
    list: listLeadBinProcedure,
    restore: leadRestoreProcedure,
    restoreAll: leadAllRestoreProcedure,
    delete: leadBinDeleteProcedure,
    deleteAll: leadBinDeleteAllProcedure,
  },
});
