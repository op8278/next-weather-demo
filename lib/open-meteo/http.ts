import https from "node:https";
import { URL } from "node:url";

/**
 * Server-side GET that forces IPv4.
 * Node's default fetch can hang on some Open-Meteo AAAA records.
 */
export function httpsGetJson(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.get(
      {
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        path: `${parsed.pathname}${parsed.search}`,
        family: 4,
        headers: {
          Accept: "application/json",
          "User-Agent": "next-weather-demo",
        },
      },
      (res) => {
        const status = res.statusCode ?? 0;
        const chunks: Buffer[] = [];

        res.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
        });

        res.on("end", () => {
          const body = Buffer.concat(chunks).toString("utf8");
          if (status < 200 || status >= 300) {
            reject(new Error(`HTTP ${status}`));
            return;
          }
          try {
            resolve(JSON.parse(body) as unknown);
          } catch {
            reject(new Error("Invalid JSON"));
          }
        });
      },
    );

    req.setTimeout(12_000, () => {
      req.destroy(new Error("Request timeout"));
    });

    req.on("error", reject);
  });
}
