import { NextRequest } from "next/server";

export function createGETRequest(url = "http://localhost:4000/api/test") {
  return new NextRequest(url, { method: "GET" });
}

export function createPOSTRequest(body: unknown, url = "http://localhost:4000/api/test") {
  return new NextRequest(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function createPUTRequest(body: unknown, url = "http://localhost:4000/api/test") {
  return new NextRequest(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function createDELETERequest(url = "http://localhost:4000/api/test") {
  return new NextRequest(url, { method: "DELETE" });
}
