"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "date-fns";
import { useForm } from "react-hook-form";

import {
  FeedbackIssueStatusEnumSchema,
  FeedbackIssueStatusEnumType,
} from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field";
import { TextareaField } from "@workspace/ui/components/form-fields/TextareaField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { UserAvatar } from "@/components/UserAvatar";

import { orpcTQClient } from "@/server/orpc.client";

import {
  useReplyFeedbackIssue,
  useUpdateFeedbackIssueStatus,
} from "../api/feedback.api.hook";
import { FeedbackIssueDetailsContractType } from "../api/feedback.contract";
import {
  FeedbackIssueReplyInput,
  feedbackIssueReplySchema,
} from "../feedback.schema";
import { FeedbackStatusBadge, FeedbackTypeBadge } from "./feedback-badges";

type FeedbackIssueDetailsOutput = NonNullable<
  FeedbackIssueDetailsContractType["output"]
>["data"];

const STATUS_OPTIONS = FeedbackIssueStatusEnumSchema.options.map((status) => ({
  value: status,
  label: formatEnumValue(status),
}));

export function FeedbackIssueDetails({
  issueId,
  isOwner,
  isAgent,
}: {
  issueId: string;
  isOwner: boolean;
  isAgent: boolean;
}) {
  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.feedback.details.queryOptions({
      input: { issueId },
    })
  );

  return (
    <QueryStateBoundary
      isLoading={isLoading}
      isError={isError}
      error={error}
      data={data?.data}
      isEmpty={() => false}
    >
      {(issue) => (
        <div className="flex w-full flex-col gap-4">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <FeedbackTypeBadge type={issue.type} />
              <FeedbackStatusBadge status={issue.status} />
            </div>
            <h1 className="text-2xl font-semibold leading-tight">
              {issue.title}
            </h1>
            <UserAvatar
              userName={issue.createdByUser.name}
              userEmail={issue.createdByUser.email}
              imageUrl={issue.createdByUser.image}
              showDetails
            />
          </div>
          <div className="grid w-full gap-4 lg:grid-cols-[1fr_340px]">
            <div className="flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">
                    {issue.description}
                  </p>
                </CardContent>
              </Card>
              <RepliesList replies={issue.replies} />
              <ReplyForm
                issueId={issue.id}
                isOwner={isOwner}
                isAgent={isAgent}
              />
            </div>
            <IssueSidebar issue={issue} isOwner={isOwner} isAgent={isAgent} />
          </div>
        </div>
      )}
    </QueryStateBoundary>
  );
}

function RepliesList({
  replies,
}: {
  replies: FeedbackIssueDetailsOutput["replies"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Replies</CardTitle>
        <CardDescription>
          {`${replies.length} ${replies.length === 1 ? "reply" : "replies"}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {replies.length === 0 ? (
          <p className="text-muted-foreground text-sm">No replies yet.</p>
        ) : (
          <div className="space-y-4">
            {replies.map((reply) => (
              <div
                key={reply.id}
                className="space-y-2 rounded-md border bg-popover p-3"
              >
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <UserAvatar
                    userName={reply.createdByUser.name}
                    userEmail={reply.createdByUser.email}
                    imageUrl={reply.createdByUser.image}
                    showDetails
                  />
                  <span className="text-xs text-muted-foreground">
                    {formatDate(reply.createdAt, "PPp")}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReplyForm({
  issueId,
  isOwner,
  isAgent,
}: {
  issueId: string;
  isOwner: boolean;
  isAgent: boolean;
}) {
  const form = useForm<FeedbackIssueReplyInput>({
    resolver: zodResolver(feedbackIssueReplySchema),
    defaultValues: {
      issueId,
      content: "",
    },
  });

  const { mutate: reply, isPending } = useReplyFeedbackIssue<
    keyof FeedbackIssueReplyInput
  >({
    onSuccess: () => {
      form.reset();
    },
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, { message });
      });
    },
  });

  const canReply = isOwner || isAgent;

  const handleSubmit = (values: FeedbackIssueReplyInput) => {
    reply(values);
  };

  if (!canReply) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a reply</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            <TextareaField
              control={form.control}
              name="content"
              placeholder="Write your reply..."
              className="min-h-24"
              disabled={isPending}
            />
            <div className="flex justify-end">
              <ButtonSpinner type="submit" isLoading={isPending}>
                Reply
              </ButtonSpinner>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

function IssueSidebar({
  issue,
  isAgent,
}: {
  issue: FeedbackIssueDetailsOutput;
  isOwner: boolean;
  isAgent: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      {isAgent && (
        <StatusControl
          key={issue.status}
          issueId={issue.id}
          status={issue.status}
        />
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Details</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <FeedbackStatusBadge status={issue.status} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Type</span>
            <FeedbackTypeBadge type={issue.type} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Opened</span>
            <span>{formatDate(issue.createdAt, "PP")}</span>
          </div>
          {issue.closedAt && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Closed</span>
              <span>{formatDate(issue.closedAt, "PP")}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusControl({
  issueId,
  status,
}: {
  issueId: string;
  status: FeedbackIssueStatusEnumType;
}) {
  const [selected, setSelected] = useState<FeedbackIssueStatusEnumType>(status);

  const { mutate: updateStatus, isPending } = useUpdateFeedbackIssueStatus();

  const handleSubmit = () => {
    if (selected === status) return;
    updateStatus({ issueId, status: selected });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Update status</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Field>
          <FieldLabel>Status</FieldLabel>
          <Select
            name="status"
            value={selected}
            onValueChange={(value) =>
              setSelected(value as FeedbackIssueStatusEnumType)
            }
            items={STATUS_OPTIONS}
            disabled={isPending}
          >
            <SelectTrigger id="feedback-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <ButtonSpinner
          type="button"
          isLoading={isPending}
          disabled={selected === status}
          onClick={handleSubmit}
        >
          Update status
        </ButtonSpinner>
      </CardContent>
    </Card>
  );
}
