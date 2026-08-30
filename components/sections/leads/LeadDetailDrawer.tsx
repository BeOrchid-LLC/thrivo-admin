"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DetailsDrawer } from "@/components/general/DetailsDrawer";
import { TableRowDetailsFooter } from "@/components/general/TableRowDetailsDrawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import type { Lead } from "@/lib/contracts";
import { LeadActionsMenu } from "./LeadActionsMenu";
import { callApi, isApiError, queryKeys, type EndpointResponse } from "@/lib/api";
import { env } from "@/lib/config/env";
import { resolveData } from "@/lib/fixtures";
import { useCapability } from "@/lib/hooks/useCapability";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LeadDetailDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onDelete: (lead: Lead) => void;
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export function LeadDetailDrawer({ lead, onClose, onDelete }: LeadDetailDrawerProps) {
  const queryClient = useQueryClient();
  const { role } = useCapability();
  const canContact = role === "admin" || role === "super-admin";
  const [note, setNote] = useState("");
  const [linkUserId, setLinkUserId] = useState("");
  const [owner, setOwner] = useState(lead?.ownerAdminEmail ?? "");
  const [tags, setTags] = useState(lead?.tags.join(", ") ?? "");
  const [contactOpen, setContactOpen] = useState(false);
  const detailQuery = useQuery({
    queryKey: queryKeys.leads.detail(lead?.id ?? ""),
    queryFn: () =>
      resolveData({ lead: { ...lead!, notes: [], linkedUser: null, recentEmails: [] } }, () =>
        callApi("GET_LEAD", { params: { id: lead!.id } })
      ),
    enabled: !!lead,
  });
  const detail =
    detailQuery.data?.lead ??
    (lead ? { ...lead, notes: [], linkedUser: null, recentEmails: [] } : null);
  const detailTags = detail?.tags.join(",") ?? "";
  useEffect(() => {
    setOwner(detail?.ownerAdminEmail ?? "");
    setTags(detailTags ? detailTags.split(",").join(", ") : "");
  }, [lead?.id, detail?.ownerAdminEmail, detailTags]);
  const updateFixtureLeadLists = (nextLead: Lead) => {
    queryClient.setQueriesData<EndpointResponse<"LIST_LEADS">>(
      { queryKey: ["leads", "list"] },
      (current) =>
        current
          ? {
              ...current,
              items: current.items.map((item) => (item.id === nextLead.id ? nextLead : item)),
            }
          : current
    );
  };
  const update = useMutation({
    mutationFn: (patch: {
      status?: "new" | "contacted" | "qualified" | "converted" | "unsubscribed" | "spam";
      ownerAdminEmail?: string | null;
      tags?: string[];
    }) =>
      env.useFixtures
        ? Promise.resolve({ lead: { ...detail!, ...patch } })
        : callApi("UPDATE_LEAD", { params: { id: lead!.id }, payload: patch }),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.leads.detail(lead!.id), data);
      if (env.useFixtures) updateFixtureLeadLists(data.lead);
      else void queryClient.invalidateQueries({ queryKey: ["leads"], exact: false });
      toast.success("Lead updated.");
    },
    onError: (error) => toast.error(isApiError(error) ? error.message : "Could not update lead."),
  });
  const addNote = useMutation({
    mutationFn: () => {
      if (env.useFixtures) {
        const createdAt = new Date().toISOString();
        const created = {
          id: `fixture-note-${Date.now()}`,
          leadId: lead!.id,
          authorAdminEmail: "fixture@beorchid.com",
          body: note,
          createdAt,
        };
        return Promise.resolve({
          lead: { ...detail!, notes: [created, ...(detail?.notes ?? [])] },
          note: created,
        });
      }
      return callApi("ADD_LEAD_NOTE", { params: { id: lead!.id }, payload: { body: note } });
    },
    onSuccess: (data) => {
      setNote("");
      queryClient.setQueryData(queryKeys.leads.detail(lead!.id), data);
      if (env.useFixtures) updateFixtureLeadLists(data.lead);
      else void queryClient.invalidateQueries({ queryKey: ["leads"], exact: false });
      toast.success("Note added.");
    },
    onError: (error) => toast.error(isApiError(error) ? error.message : "Could not add note."),
  });
  const contact = useMutation({
    mutationFn: () =>
      env.useFixtures
        ? Promise.resolve({
            lead: { ...detail!, status: "contacted" as const },
            emailLogId: `fixture-email-${Date.now()}`,
          })
        : callApi("CONTACT_LEAD", {
            params: { id: lead!.id },
            payload: { template: "launch_update", confirmation: "SEND" },
            idempotencyKey: crypto.randomUUID(),
          }),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.leads.detail(lead!.id), data);
      if (env.useFixtures) updateFixtureLeadLists(data.lead);
      else void queryClient.invalidateQueries({ queryKey: ["leads"], exact: false });
      toast.success("Launch update queued.");
    },
    onError: (error) => toast.error(isApiError(error) ? error.message : "Could not contact lead."),
  });
  const linkUser = useMutation({
    mutationFn: () =>
      env.useFixtures
        ? Promise.resolve({
            lead: {
              ...detail!,
              reconciledUserId: linkUserId,
              status: "converted" as const,
            },
          })
        : callApi("LINK_LEAD_USER", {
            params: { id: lead!.id },
            payload: { userId: linkUserId },
          }),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.leads.detail(lead!.id), data);
      setLinkUserId("");
      if (env.useFixtures) updateFixtureLeadLists(data.lead);
      else void queryClient.invalidateQueries({ queryKey: ["leads"], exact: false });
      toast.success("Lead linked to user.");
    },
    onError: (error) => toast.error(isApiError(error) ? error.message : "Could not link user."),
  });
  return (
    <DetailsDrawer
      open={lead !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={lead?.email ?? "Lead"}
      description={lead ? `Captured ${formatDate(lead.capturedAt)}` : undefined}
      metadata={lead ?? undefined}
      dataName="lead"
      footer={({ onViewMetadata }) =>
        lead ? (
          <TableRowDetailsFooter
            actionsMenu={<LeadActionsMenu lead={lead} onDelete={onDelete} align="start" />}
            hasMetadata={lead !== undefined}
            onViewMetadata={onViewMetadata}
          />
        ) : null
      }
    >
      {lead ? (
        <Card>
          <CardHeader>
            <CardTitle>Lead details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Source" value={lead.source ?? "—"} />
            <Row
              label="Status"
              value={
                detail ? (
                  <Select
                    value={detail.status}
                    onValueChange={(value) =>
                      update.mutate({ status: value as typeof detail.status })
                    }
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["new", "contacted", "qualified", "converted", "unsubscribed", "spam"].map(
                        (value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                ) : (
                  "—"
                )
              }
            />
            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="lead-owner">Owner email</Label>
              <Input
                id="lead-owner"
                type="email"
                value={owner}
                onChange={(event) => setOwner(event.target.value)}
                placeholder="Unassigned"
              />
              <Label htmlFor="lead-tags">Tags</Label>
              <Input
                id="lead-tags"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="launch, priority"
              />
              <Button
                size="sm"
                variant="outline"
                disabled={update.isPending}
                onClick={() =>
                  update.mutate({
                    ownerAdminEmail: owner.trim() || null,
                    tags: tags
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  })
                }
              >
                {update.isPending ? "Saving…" : "Save assignment"}
              </Button>
            </div>
            <Row label="Country" value={lead.country ?? "—"} />
            <Row label="Device" value={lead.deviceType ?? "—"} />
            <Row
              label="OS"
              value={[lead.osName, lead.osVersion].filter(Boolean).join(" ") || "—"}
            />
            <Row
              label="Browser"
              value={[lead.browserName, lead.browserVersion].filter(Boolean).join(" ") || "—"}
            />
            <Row label="Referrer" value={lead.referrer ?? "—"} />
            <Row label="UTM source" value={lead.utmSource ?? "—"} />
            <Row label="UTM medium" value={lead.utmMedium ?? "—"} />
            <Row label="UTM campaign" value={lead.utmCampaign ?? "—"} />
            <Row label="Submissions" value={lead.submissionCount} />
            <Row label="First captured" value={formatDate(lead.capturedAt)} />
            <Row label="Last submitted" value={formatDate(lead.lastSubmittedAt)} />
            {detail?.reconciledUserId ? (
              <div className="space-y-1">
                <Link
                  className="inline-flex text-sm font-medium text-primary hover:underline"
                  href={`/users/${detail.reconciledUserId}`}
                >
                  Open linked user
                </Link>
                {detail.linkedUser ? (
                  <p className="text-xs text-muted-foreground">
                    {detail.linkedUser.name ?? "Unnamed user"} · {detail.linkedUser.email} ·{" "}
                    {detail.linkedUser.tier}
                  </p>
                ) : null}
              </div>
            ) : null}
            {detail?.recentEmails?.length ? (
              <div className="space-y-2 border-t pt-4">
                <p className="font-medium">Recent lead emails</p>
                {detail.recentEmails.map((email) => (
                  <div key={email.id} className="flex items-center justify-between gap-3 text-xs">
                    <span>{email.template}</span>
                    <span className="text-muted-foreground">
                      {email.status} · {formatDate(email.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="lead-note">Add note</Label>
              <Textarea
                id="lead-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Internal note…"
              />
              <Button
                size="sm"
                disabled={!note.trim() || addNote.isPending}
                onClick={() => addNote.mutate()}
              >
                {addNote.isPending ? "Saving…" : "Add note"}
              </Button>
            </div>
            {detail?.notes?.length ? (
              <div className="space-y-2 border-t pt-4">
                <p className="font-medium">Notes</p>
                {detail.notes.map((item) => (
                  <div key={item.id} className="rounded-md bg-muted/40 p-2">
                    <p>{item.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.authorAdminEmail} · {formatDate(item.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
            {canContact && detail?.status !== "unsubscribed" && detail?.status !== "spam" ? (
              <Button
                variant="outline"
                disabled={contact.isPending}
                onClick={() => setContactOpen(true)}
              >
                {contact.isPending ? "Queueing…" : "Contact lead"}
              </Button>
            ) : null}
            {!detail?.reconciledUserId ? (
              <div className="space-y-2 border-t pt-4">
                <Label htmlFor="lead-user-id">Link user</Label>
                <div className="flex gap-2">
                  <Input
                    id="lead-user-id"
                    value={linkUserId}
                    onChange={(event) => setLinkUserId(event.target.value)}
                    placeholder="User ID (email is verified server-side)"
                  />
                  <Button
                    variant="outline"
                    disabled={!linkUserId || linkUser.isPending}
                    onClick={() => linkUser.mutate()}
                  >
                    Link
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact this lead?</DialogTitle>
            <DialogDescription>
              This sends the approved Thrivo launch update template to {lead?.email}. The
              recipient&apos;s suppression status will be checked again before queueing.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            <p className="font-medium">A Thrivo update</p>
            <p className="mt-1 text-muted-foreground">
              We’re getting closer to launch. We’ll keep you posted with the next update.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={contact.isPending}
              onClick={() => {
                contact.mutate();
                setContactOpen(false);
              }}
            >
              {contact.isPending ? "Queueing…" : "Send approved update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DetailsDrawer>
  );
}
