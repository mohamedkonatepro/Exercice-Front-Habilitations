import { afterEach, describe, expect, it, vi, type Mock } from "vitest";
import type { AccessRequest } from "@/schemas/accessRequests";
import {
  createAccessRequest,
  getAccessRequest,
  listAccessRequests,
  reviewAccessRequest,
} from "./accessRequests";

const REQUEST_FIXTURE: AccessRequest = {
  id: "req-1001",
  requesterName: "Alice Martin",
  applicationId: "app-crm",
  roleId: "reader",
  reason: "Consultation des informations commerciales.",
  status: "PENDING",
  createdAt: "2026-06-28T09:12:00.000Z",
  reviewedAt: null,
  reviewComment: null,
};

function stubFetch(body: unknown): Mock {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function requestedUrl(fetchMock: Mock): string {
  return String(fetchMock.mock.calls[0][0]);
}

function requestedInit(fetchMock: Mock): RequestInit {
  return fetchMock.mock.calls[0][1] as RequestInit;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("listAccessRequests", () => {
  it("appelle l'endpoint sans query string quand il n'y a pas de filtre", async () => {
    const fetchMock = stubFetch({ data: [REQUEST_FIXTURE] });

    await expect(listAccessRequests()).resolves.toEqual([REQUEST_FIXTURE]);
    expect(requestedUrl(fetchMock)).toBe("/api/access-requests");
  });

  it("transmet les filtres status et q en query params", async () => {
    const fetchMock = stubFetch({ data: [] });

    await listAccessRequests({ status: "PENDING", q: "alice" });

    expect(requestedUrl(fetchMock)).toBe("/api/access-requests?status=PENDING&q=alice");
  });
});

describe("getAccessRequest", () => {
  it("encode l'identifiant dans l'URL", async () => {
    const fetchMock = stubFetch({ data: REQUEST_FIXTURE });

    await expect(getAccessRequest("req 1001")).resolves.toEqual(REQUEST_FIXTURE);
    expect(requestedUrl(fetchMock)).toBe("/api/access-requests/req%201001");
  });
});

describe("createAccessRequest", () => {
  it("envoie un POST JSON avec le payload de création", async () => {
    const fetchMock = stubFetch({ data: REQUEST_FIXTURE });
    const input = {
      requesterName: "Alice Martin",
      applicationId: "app-crm",
      roleId: "reader",
      reason: "Consultation des informations commerciales.",
    };

    await expect(createAccessRequest(input)).resolves.toEqual(REQUEST_FIXTURE);

    const init = requestedInit(fetchMock);
    expect(requestedUrl(fetchMock)).toBe("/api/access-requests");
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual(input);
  });
});

describe("reviewAccessRequest", () => {
  it("envoie un PATCH sur /review avec la décision et le commentaire", async () => {
    const fetchMock = stubFetch({ data: { ...REQUEST_FIXTURE, status: "APPROVED" } });

    await reviewAccessRequest({
      id: "req-1001",
      decision: "APPROVED",
      reviewComment: "OK pour moi.",
    });

    const init = requestedInit(fetchMock);
    expect(requestedUrl(fetchMock)).toBe("/api/access-requests/req-1001/review");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(String(init.body))).toEqual({
      decision: "APPROVED",
      reviewComment: "OK pour moi.",
    });
  });
});
