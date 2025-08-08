import {
  CgPluginLibHost,
  type UserInfoResponsePayload,
  type PluginResponse,
  type CommunityInfoResponsePayload,
  type PluginResponseInner
} from '@common-ground-dao/cg-plugin-lib-host';
import env from "./env";

const privateKey = env.PLUGIN_PRIVATE_KEY;
const publicKey = env.VITE_PLUGIN_PUBLIC_KEY;
let _pluginLib: Promise<CgPluginLibHost> | null = null;

function getPluginLib() {
  if (!privateKey || !publicKey) {
    throw new Error("Private and public key configuration invalid, keys missing.");
  }
  if (!_pluginLib) {
    _pluginLib = CgPluginLibHost.initialize(privateKey, publicKey);
  }
  return _pluginLib;
}

export async function validateData(data: string) {
  const pluginLib = await getPluginLib();
  const envelope = JSON.parse(data) as PluginResponse;

  if (
    typeof envelope?.response !== "string" ||
    typeof envelope?.signature !== "string"
  ) {
    throw new Error("Invalid signed data envelope");
  }

  const validSignature = await pluginLib.verifyResponse(envelope.response, envelope.signature);
  if (!validSignature) {
    throw new Error("Invalid signature");
  }

  const result = JSON.parse(envelope.response) as PluginResponseInner & { data: CommunityInfoResponsePayload | UserInfoResponsePayload };
  const signatureTimestampString = result.requestId.match(/^requestId-([0-9]+)-.*$/)?.[1];
  const signatureTimestamp = signatureTimestampString ? parseInt(signatureTimestampString) : 0;
  return {
    result,
    signatureTimestamp,
  };
}

export async function validateCommunityData(data: string) {
  const { result, signatureTimestamp } = await validateData(data);
  return {
    result: result as PluginResponseInner & { data: CommunityInfoResponsePayload },
    signatureTimestamp,
  };
}

export async function validateUserData(data: string) {
  const { result, signatureTimestamp } = await validateData(data);
  return {
    result: result as PluginResponseInner & { data: UserInfoResponsePayload },
    signatureTimestamp,
  };
}

export function isUserAdmin(communityInfo: CommunityInfoResponsePayload, userInfo: UserInfoResponsePayload) {
  const adminRole = communityInfo.roles.find((role) => role.title === "Admin" && role.type === "PREDEFINED");
  if (!adminRole) {
    throw new Error("Community does not have an admin role");
  }
  return userInfo.roles.some((roleId) => roleId === adminRole.id);
}