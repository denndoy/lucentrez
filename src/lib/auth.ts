import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const COOKIE_NAME = "lucentrezn_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const SESSION_VERSION = "v1";

function getSecret(): string {
  const secret = process.env.ADMIN_SECRET?.trim();

  if (!secret || secret.length < 32) {
    throw new Error("Missing or weak ADMIN_SECRET. Set a random secret with at least 32 characters.");
  }

  return secret;
}

function getAdminUsername(): string {
  const username = process.env.ADMIN_USERNAME?.trim();

  if (!username) {
    throw new Error("Missing ADMIN_USERNAME environment variable.");
  }

  return username;
}

function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;

  if (!password || password.length < 12) {
    throw new Error("Missing or weak ADMIN_PASSWORD. Use at least 12 characters.");
  }

  return password;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function safeEqualHex(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
}

export function createSession(username: string): string {
  const issuedAt = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString("hex");
  const payload = `${SESSION_VERSION}.${username}.${issuedAt}.${nonce}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifySession(token?: string | null): boolean {
  if (!token) {
    return false;
  }

  const [version, username, issuedAtRaw, nonce, signature] = token.split(".");
  if (!version || !username || !issuedAtRaw || !nonce || !signature) {
    return false;
  }

  if (version !== SESSION_VERSION) {
    return false;
  }

  const expected = sign(`${version}.${username}.${issuedAtRaw}.${nonce}`);
  if (!safeEqualHex(expected, signature)) {
    return false;
  }

  const issuedAt = Number(issuedAtRaw);
  if (Number.isNaN(issuedAt)) {
    return false;
  }

  return Date.now() - issuedAt <= SESSION_TTL_MS;
}

export async function isAdminSessionFromCookies(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifySession(cookieStore.get(COOKIE_NAME)?.value);
}

export function isAdminRequest(request: NextRequest): boolean {
  return verifySession(request.cookies.get(COOKIE_NAME)?.value ?? null);
}

export function getAdminCookieName(): string {
  return COOKIE_NAME;
}

export function validateAdminCredentials(username: string, password: string): boolean {
  return username === getAdminUsername() && password === getAdminPassword();
}
