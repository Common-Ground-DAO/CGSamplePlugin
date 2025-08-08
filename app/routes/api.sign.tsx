import { CgPluginLibHost } from "@common-ground-dao/cg-plugin-lib-host";
import env from "../lib/.server/env";

// API-only route - handles POST requests to create airdrops
export async function action({ request }: { request: Request }) {
  const body = await request.json();
  const pluginLib = await CgPluginLibHost.initialize(env.PLUGIN_PRIVATE_KEY!, env.VITE_PLUGIN_PUBLIC_KEY!);
  const signedRequest = await pluginLib.signRequest(body);
  return signedRequest;
}