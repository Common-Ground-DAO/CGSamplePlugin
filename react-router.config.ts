import type { Config } from "@react-router/dev/config";
import env from "./app/lib/.server/env";

export default {
  ssr: true,
  basename: env.VITE_URL_PREFIX || "/",
} satisfies Config;