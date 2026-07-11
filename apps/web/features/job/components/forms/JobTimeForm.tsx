"use client";

import { useQuery } from "@tanstack/react-query";
import { UseFormReturn } from "react-hook-form";

import { DateTimeDayButton } from "@workspace/ui/components/date-time-picker";
import { FieldGroup } from "@workspace/ui/components/field";
import { DateTimePickerField } from "@workspace/ui/components/form-fields/DateTimePickerField";
import { Skeleton } from "@workspace/ui/components/skeleton";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { orpcTQClient } from "@/server/orpc.client";

import { JobTimeUpdateType } from "../../job.schema";

interface JobTimeFormProps {
  formId?: string;
  form: UseFormReturn<JobTimeUpdateType>;
  onSubmit: (e: JobTimeUpdateType) => void;
  isSubmitting: boolean;
}

export function JobTimeForm({
  formId = "job_time_form",
  form,
  onSubmit,
  isSubmitting,
}: JobTimeFormProps) {
  "use no memo";
  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.job.listServicings.queryOptions()
  );

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <QueryStateBoundary
          data={data?.data}
          isLoading={isLoading}
          isError={isError}
          error={error}
          isEmpty={() => false}
          loadingFallback={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10 rounded-md w-full" />
              <Skeleton className="h-10 rounded-md w-full" />
            </div>
          }
        >
          {(data) => (
            <DateTimePickerField
              control={form.control}
              name="serviceAt"
              label="Service at"
              calendarProps={{
                disabled: {
                  before: new Date(),
                },
                className: "[--cell-size:--spacing(12)]",
                components: {
                  DayButton: (props) => (
                    <DateTimeDayButton {...props} bookings={data} />
                  ),
                },
              }}
              showTimeSelection
              description="When the service will be performed"
              disabled={isSubmitting}
            />
          )}
        </QueryStateBoundary>
      </FieldGroup>
    </form>
  );
}
