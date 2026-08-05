import {
  createFeedbackIssueProcedure,
  feedbackIssueDetailsProcedure,
  listFeedbackIssuesProcedure,
  replyFeedbackIssueProcedure,
  updateFeedbackIssueStatusProcedure,
} from "./feedback.procedure";

export const feedbackRouter = {
  list: listFeedbackIssuesProcedure,
  details: feedbackIssueDetailsProcedure,
  create: createFeedbackIssueProcedure,
  reply: replyFeedbackIssueProcedure,
  updateStatus: updateFeedbackIssueStatusProcedure,
};
