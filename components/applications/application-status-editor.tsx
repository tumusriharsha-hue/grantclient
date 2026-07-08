"use client";

import { useState } from "react";
import { updateApplicationStatus } from "@/app/actions/applications";
import { Badge, Card } from "@/components/ui";
import { ApplicationStatusForm } from "./application-status-form";
import { EditableApplicationTitle } from "./editable-application-title";

type ApplicationStatus = "drafting" | "submitted" | "approved" | "rejected";

interface ApplicationStatusEditorProps {
  applicationId: string;
  title: string;
  initialStatus: ApplicationStatus;
  initialStatusDate?: string;
  initialDecisionDate?: string;
  amount?: string;
  note?: string;
}

const statusLabels: Record<ApplicationStatus, string> = {
  drafting: "Drafting",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
};

function getStatusVariant(status: ApplicationStatus) {
  switch (status) {
    case "approved":
      return "success";
    case "rejected":
      return "danger";
    case "submitted":
      return "default";
    case "drafting":
    default:
      return "neutral";
  }
}

function isApplicationStatus(status: string): status is ApplicationStatus {
  return ["drafting", "submitted", "approved", "rejected"].includes(status);
}

export function ApplicationStatusEditor({
  applicationId,
  title,
  initialStatus,
  initialStatusDate,
  initialDecisionDate,
  amount,
  note,
}: ApplicationStatusEditorProps) {
  const [status, setStatus] = useState(initialStatus);

  function handleStatusChange(nextStatus: string) {
    if (isApplicationStatus(nextStatus)) {
      setStatus(nextStatus);
    }
  }

  return (
    <Card padding="lg">
      <form action={updateApplicationStatus}>
        <input type="hidden" name="applicationId" value={applicationId} />
        <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <EditableApplicationTitle initialTitle={title} name="title" />
            <p className="mt-1 text-sm text-text-secondary">
              Update where this application stands in your pipeline.
            </p>
          </div>
          <Badge className="shrink-0" variant={getStatusVariant(status)}>
            {statusLabels[status]}
          </Badge>
        </div>

        <ApplicationStatusForm
          initialStatus={initialStatus}
          initialStatusDate={initialStatusDate}
          initialDecisionDate={initialDecisionDate}
          amount={amount}
          note={note}
          onStatusChange={handleStatusChange}
        />
      </form>
    </Card>
  );
}
