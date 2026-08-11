import { Calendar } from "lucide-react";

import { KanbanCard } from "@workspace/ui/components/kibo-ui/kanban";

import { FormatDateCell } from "@/components/shared/format-date/FormatDateCell";
import { UserAvatar } from "@/components/UserAvatar";

import { ListOrgTaskContractType } from "../api/orgTask.contract";
import { TaskPriorityBadge } from "./TaskPriorityBadge";

export function OrgTaskKanbanCard({
  columnId,
  taskData,
}: {
  columnId: string;
  taskData: Omit<
    ListOrgTaskContractType["output"]["data"]["data"][number],
    "title"
  > & {
    name: string;
    column: string;
  };
}) {
  return (
    <KanbanCard
      column={columnId}
      id={taskData.id}
      key={taskData.id}
      name={taskData.name}
    >
      <div className="space-y-2">
        <TaskPriorityBadge priority={taskData.priority} />
        <div className="text-sm line-clamp-2 leading-none">{taskData.name}</div>
        {taskData.assignedByMember && (
          <UserAvatar
            userName={taskData.assignedByMember.name}
            userEmail={taskData.assignedByMember.email}
            imageUrl={taskData.assignedByMember.image}
            userRoles={taskData.assignedByMember.roles}
            showDetails
            showRoleDetails
          />
        )}
        {taskData.dueDate && (
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <Calendar className="size-3" />
            <FormatDateCell format="p" value={taskData.dueDate} />
            <FormatDateCell
              className="ml-auto"
              format="P"
              value={taskData.dueDate}
            />
          </div>
        )}
      </div>
    </KanbanCard>
  );
}
