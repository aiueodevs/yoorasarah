const EMAIL_AUTH_FIELDS_BY_PATH = new Map([
  ["/api/auth/sign-in/email", ["email"]],
  ["/api/auth/sign-up/email", ["email"]],
  ["/api/auth/send-verification-email", ["email"]],
  ["/api/auth/change-email", ["newEmail"]]
]);

function getAuthEmailFields(request: Request) {
  if (request.method !== "POST") return false;
  return EMAIL_AUTH_FIELDS_BY_PATH.get(new URL(request.url).pathname) ?? null;
}

function normalizeEmailValue(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : value;
}

export async function normalizeAuthEmailRequest(request: Request) {
  const emailFields = getAuthEmailFields(request);
  if (!emailFields) return request;

  const contentType = request.headers.get("content-type") ?? "";
  const headers = new Headers(request.headers);

  if (contentType.includes("application/json")) {
    const body = await request.clone().json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) return request;

    const normalizedBody = { ...body } as Record<string, unknown>;
    for (const field of emailFields) {
      if (field in normalizedBody) {
        normalizedBody[field] = normalizeEmailValue(normalizedBody[field]);
      }
    }

    headers.set("content-type", "application/json");
    return new Request(request, {
      body: JSON.stringify(normalizedBody),
      headers
    });
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const form = new URLSearchParams(await request.clone().text());
    let changed = false;

    for (const field of emailFields) {
      const email = form.get(field);
      if (email === null) continue;
      form.set(field, email.trim().toLowerCase());
      changed = true;
    }

    if (!changed) return request;
    headers.set("content-type", "application/x-www-form-urlencoded");
    return new Request(request, {
      body: form.toString(),
      headers
    });
  }

  return request;
}
