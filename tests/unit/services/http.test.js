import { describe, expect, it, vi } from "vitest";
import { HttpError, requestJson } from "@/services/http";

const jsonResponse = (body, { ok = true, status = 200 } = {}) => ({
  ok,
  status,
  json: async () => body,
});

describe("requestJson", () => {
  it("返回解析后的 JSON", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ ok: 1 }));
    await expect(requestJson("https://example.test/a", { fetchImpl })).resolves.toEqual({ ok: 1 });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("HTTP 非 2xx 抛出 HttpError 并保留状态码", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({}, { ok: false, status: 503 }));
    await expect(requestJson("https://example.test/a", { fetchImpl })).rejects.toMatchObject({
      name: "HttpError",
      status: 503,
    });
  });

  it("超时抛出 HttpError", async () => {
    vi.useFakeTimers();
    const fetchImpl = vi.fn(
      (url, { signal }) =>
        new Promise((resolve, reject) => {
          signal.addEventListener("abort", () => {
            const error = new Error("aborted");
            error.name = "AbortError";
            reject(error);
          });
        }),
    );

    const promise = requestJson("https://example.test/slow", { fetchImpl, timeout: 100 });
    const assertion = expect(promise).rejects.toBeInstanceOf(HttpError);

    await vi.advanceTimersByTimeAsync(150);
    await assertion;
    vi.useRealTimers();
  });
});
