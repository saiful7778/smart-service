"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import { useForm } from "react-hook-form";

import { FeedbackIssueTypeEnumSchema } from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogResponsiveBody,
  DialogResponsiveContent,
  DialogStickyFooter,
  DialogStickyHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { FieldGroup } from "@workspace/ui/components/field";
import { InputField } from "@workspace/ui/components/form-fields/InputField";
import { SelectField } from "@workspace/ui/components/form-fields/SelectField";
import { TextareaField } from "@workspace/ui/components/form-fields/TextareaField";

import { useCreateFeedbackIssue } from "../api/feedback.api.hook";
import {
  FeedbackIssueCreateInput,
  feedbackIssueCreateSchema,
} from "../feedback.schema";

const ISSUE_TYPE_OPTIONS = FeedbackIssueTypeEnumSchema.options.map((type) => ({
  value: type,
  label: formatEnumValue(type),
}));

export function CreateFeedbackIssueDialog() {
  "use no memo";
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const form = useForm<FeedbackIssueCreateInput>({
    resolver: zodResolver(feedbackIssueCreateSchema),
    defaultValues: {
      type: "FEEDBACK",
      title: "",
      description: "",
    },
  });

  const { mutate, isPending } = useCreateFeedbackIssue<
    keyof FeedbackIssueCreateInput
  >({
    onSuccess: () => {
      form.reset();
      setOpenDialog(false);
    },
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, { message });
      });
    },
  });

  const handleSubmit = (e: FeedbackIssueCreateInput) => {
    mutate(e);
  };

  const formId = "issue_create_form_id";

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger render={<Button className="w-fit" />}>
        <PlusCircle />
        <span>New Issue</span>
      </DialogTrigger>
      <DialogResponsiveContent>
        <DialogStickyHeader>
          <DialogTitle>Submit a new issue</DialogTitle>
          <DialogDescription>
            Found a bug or have a suggestion? Let us know.
          </DialogDescription>
        </DialogStickyHeader>

        <DialogResponsiveBody>
          <form id={formId} onSubmit={form.handleSubmit(handleSubmit)}>
            <FieldGroup>
              <SelectField
                control={form.control}
                name="type"
                label="Type"
                requiredField
                options={ISSUE_TYPE_OPTIONS}
                disabled={isPending}
              />
              <InputField
                control={form.control}
                name="title"
                label="Title"
                requiredField
                placeholder="Short summary of your issue"
                disabled={isPending}
              />
              <TextareaField
                control={form.control}
                name="description"
                label="Description"
                requiredField
                placeholder="Describe the issue or suggestion in detail..."
                className="min-h-32"
                disabled={isPending}
              />
            </FieldGroup>
          </form>
        </DialogResponsiveBody>

        <DialogStickyFooter>
          <DialogClose
            render={<Button variant="outline" disabled={isPending} />}
          >
            Cancel
          </DialogClose>
          <ButtonSpinner form={formId} type="submit" isLoading={isPending}>
            Submit issue
          </ButtonSpinner>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}
