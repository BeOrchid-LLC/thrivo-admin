import type { EndpointResponse } from "@/lib/api";

const cursorPage = { nextCursor: null, total: 0, limit: 20 };

export const fixtureBillingEvents = {
  items: [],
  pagination: cursorPage,
} as EndpointResponse<"LIST_BILLING_EVENTS">;

export const fixtureWebhooks = {
  items: [],
  pagination: cursorPage,
} as EndpointResponse<"LIST_WEBHOOKS">;

export const fixtureFoods = {
  items: [],
  pagination: cursorPage,
} as EndpointResponse<"LIST_FOODS">;

export const fixtureCheckinNotes = {
  items: [],
  pagination: cursorPage,
} as EndpointResponse<"LIST_CHECKIN_NOTES">;

export const fixtureUploads = {
  items: [],
  pagination: cursorPage,
} as EndpointResponse<"LIST_MODERATION_UPLOADS">;

export const fixturePushCampaigns = {
  items: [],
  pagination: cursorPage,
} as EndpointResponse<"LIST_PUSH_CAMPAIGNS">;

export const fixtureAccountErasures = {
  erasures: [],
  pagination: { page: 1, pageSize: 20, total: 0, totalPages: 1 },
} as EndpointResponse<"LIST_ACCOUNT_ERASURES">;

export const fixtureFoodDetail = {
  food: {
    id: "fixture-food",
    name: "Fixture oats",
    brand: null,
    barcode: null,
    tier: "authoritative",
    origin: "seed",
    status: "active",
    createdBy: null,
    verifiedAt: null,
    mergedIntoId: null,
    logCount: 0,
    createdAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
    nutrients: null,
    servings: [],
  },
} as unknown as EndpointResponse<"GET_FOOD">;

export const fixturePushCampaignDetail = {
  campaign: {
    id: "fixture-campaign",
    title: "Fixture campaign",
    body: "Fixture push campaign",
    deepLink: null,
    status: "draft",
    segment: { all: true },
    recipientCount: 0,
    sentCount: 0,
    failedCount: 0,
    createdByAdminEmail: "fixture@beorchid.com",
    createdAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
    scheduledAt: null,
    sentAt: null,
  },
} as unknown as EndpointResponse<"GET_PUSH_CAMPAIGN">;

export const fixtureWebhookDetail = {
  webhook: {
    id: "fixture-webhook",
    provider: "revenuecat",
    eventId: "fixture-event",
    status: "processed",
    receivedAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
    processedAt: new Date("2026-01-01T00:01:00.000Z").toISOString(),
    payload: { fixture: true },
  },
} as unknown as EndpointResponse<"GET_WEBHOOK">;
