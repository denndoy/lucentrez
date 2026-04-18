import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { ensureSameOrigin } from "@/lib/request-security";

export function logBackendError(scope: string, error: unknown, details?: Record<string, unknown>) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[backend] ${scope}`, {
    message,
    ...details,
  });
}

export function requireAdminAccess(request: NextRequest, options?: { enforceOrigin?: boolean }) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (options?.enforceOrigin ?? true) {
    const originError = ensureSameOrigin(request);
    if (originError) {
      return originError;
    }
  }

  return null;
}

export async function parseJsonBody<T>(request: NextRequest): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
