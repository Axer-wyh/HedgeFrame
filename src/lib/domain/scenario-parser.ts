import type { RiskScenario, RiskType } from "./types";

const monthMap: Record<string, string> = {
  jan: "01",
  january: "01",
  feb: "02",
  february: "02",
  mar: "03",
  march: "03",
  apr: "04",
  april: "04",
  may: "05",
  jun: "06",
  june: "06",
  jul: "07",
  july: "07",
  aug: "08",
  august: "08",
  sep: "09",
  september: "09",
  oct: "10",
  october: "10",
  nov: "11",
  november: "11",
  dec: "12",
  december: "12",
};

export function parseScenario(rawText: string): RiskScenario {
  const normalized = rawText.toLowerCase();
  const riskType = inferRiskType(normalized);
  const exposureAmount = parseExposureAmount(normalized);
  const date = parseDate(normalized);

  return {
    rawText,
    riskType,
    subject: inferSubject(normalized, riskType),
    location: inferLocation(rawText, riskType),
    trigger: inferTrigger(normalized, riskType),
    exposureAmount,
    currency: "USD",
    targetCoverage: 0.4,
    budget: Math.round(exposureAmount * 0.15),
    timeWindow: {
      start: date,
      end: date,
    },
    status: exposureAmount > 0 ? "parsed" : "needs_review",
  };
}

function inferRiskType(text: string): RiskType {
  if (/(rain|storm|hurricane|weather|outdoor|event)/.test(text)) {
    return "weather_event";
  }

  if (/(shipment|shipping|route|crude|oil|war|strait|middle east)/.test(text)) {
    return "shipping_geopolitical";
  }

  if (/(cpi|inflation|rate|macro)/.test(text)) {
    return "macro_event";
  }

  return "unknown";
}

function inferSubject(text: string, riskType: RiskType): string {
  if (riskType === "weather_event" && text.includes("outdoor event")) {
    return "outdoor event";
  }

  if (riskType === "shipping_geopolitical") {
    return "crude oil shipment";
  }

  return "business exposure";
}

function inferLocation(rawText: string, riskType: RiskType): string {
  const knownLocations = ["Austin", "Texas", "Miami", "Middle East", "United States"];
  const found = knownLocations.find((location) =>
    rawText.toLowerCase().includes(location.toLowerCase()),
  );

  if (found) {
    return found;
  }

  if (riskType === "shipping_geopolitical") {
    return "Middle East";
  }

  return "Unspecified";
}

function inferTrigger(text: string, riskType: RiskType): string {
  if (text.includes("heavy rain")) {
    return "heavy rain";
  }

  if (riskType === "shipping_geopolitical") {
    return "war or route disruption";
  }

  return "event occurrence";
}

function parseExposureAmount(text: string): number {
  const amountMatch = text.match(/\$?\s?(\d+(?:\.\d+)?)\s?(k|m|million|thousand)?/);

  if (!amountMatch) {
    return 0;
  }

  const value = Number(amountMatch[1]);
  const suffix = amountMatch[2];

  if (suffix === "m" || suffix === "million") {
    return Math.round(value * 1_000_000);
  }

  if (suffix === "k" || suffix === "thousand") {
    return Math.round(value * 1_000);
  }

  return Math.round(value);
}

function parseDate(text: string): string {
  const monthDay = text.match(
    /(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})/,
  );

  if (!monthDay) {
    return "2026-10-12";
  }

  const month = monthMap[monthDay[1]];
  const day = monthDay[2].padStart(2, "0");

  return `2026-${month}-${day}`;
}
