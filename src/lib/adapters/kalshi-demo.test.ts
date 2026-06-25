import { constants, generateKeyPairSync, verify } from "node:crypto";
import { describe, expect, it } from "vitest";

import { signKalshiRequest } from "./kalshi-demo";

describe("Kalshi demo adapter", () => {
  it("signs requests with RSA-PSS SHA256 over timestamp, method, and path", () => {
    const { privateKey, publicKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
    });
    const privateKeyPem = privateKey.export({
      type: "pkcs8",
      format: "pem",
    }) as string;
    const signature = signKalshiRequest({
      privateKey: privateKeyPem,
      timestamp: "1703123456789",
      method: "POST",
      path: "/trade-api/v2/portfolio/events/orders?ignored=true",
    });

    expect(
      verify(
        "sha256",
        Buffer.from("1703123456789POST/trade-api/v2/portfolio/events/orders"),
        {
          key: publicKey,
          padding: constants.RSA_PKCS1_PSS_PADDING,
          saltLength: constants.RSA_PSS_SALTLEN_DIGEST,
        },
        Buffer.from(signature, "base64"),
      ),
    ).toBe(true);
  });
});
