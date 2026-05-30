import { Client } from "@upstash/qstash";

import { QstashClient } from "./types";

interface QstashClientConfig {
  token: string;
  baseUrl: string;
}

export function createQstashClient({
  token,
  baseUrl,
}: QstashClientConfig): QstashClient {
  const qstash = new Client({
    token,
    baseUrl,
  });

  return qstash;
}
