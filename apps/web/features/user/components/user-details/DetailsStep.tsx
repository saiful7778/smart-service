"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDate } from "date-fns";

import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent } from "@workspace/ui/components/card";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { orpcTQClient } from "@/server/orpc.client";

export function DetailsStep({ userId }: { userId: string }) {
  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.user.details.queryOptions({
      input: {
        userId,
      },
    })
  );

  return (
    <QueryStateBoundary
      isLoading={isLoading}
      isError={isError}
      error={error}
      isEmpty={() => false}
      data={data?.data}
    >
      {(data) => (
        <Card>
          <CardContent>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
              <DetailsItem title="Name">{data.name}</DetailsItem>
              <DetailsItem title="Email">
                {data.email}{" "}
                <Badge variant={data.emailVerified ? "default" : "secondary"}>
                  {data.emailVerified ? "Verified" : "Unverified"}
                </Badge>
              </DetailsItem>
              <DetailsItem title="Registered at">
                {formatDate(new Date(data.createdAt), "dd, MMM yyyy")}
              </DetailsItem>
              <DetailsItem title="Last login at">
                {data.lastLogin
                  ? formatDate(
                      new Date(data.lastLogin),
                      "dd/MM/yy - hh:mm:ss a"
                    )
                  : "N/A"}
              </DetailsItem>
            </div>
          </CardContent>
        </Card>
      )}
    </QueryStateBoundary>
  );
}

function DetailsItem({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-muted-foreground font-medium">{title}</div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
