import { isUserAdmin, validateCommunityData, validateUserData } from '~/lib/.server/cgDataUtils';
import { prisma } from '~/lib/.server/db';

// API-only route - handles POST requests to create airdrops
export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const airdropId = formData.get("airdropId") as string;
  const communityInfoRaw = formData.get("communityInfoRaw") as string;
  const userInfoRaw = formData.get("userInfoRaw") as string;

  // Todo: validate all fields?

  const communityInfo = await validateCommunityData(communityInfoRaw);
  const userInfo = await validateUserData(userInfoRaw);
  const communityInfoTimestampAge = Date.now() - communityInfo.signatureTimestamp;
  const userInfoTimestampAge = Date.now() - userInfo.signatureTimestamp;

  if (communityInfoTimestampAge > 120_000 || userInfoTimestampAge > 120_000) {
    throw new Error("The provided signed community or user data is too old, please try again.");
  }
  const isAdmin = isUserAdmin(communityInfo.result.data, userInfo.result.data);
  if (!isAdmin) {
    throw new Error("User is not an admin");
  }

  const deletedAirdrop = await prisma.airdrop.delete({
    where: {
      id: parseInt(airdropId),
      communityId: communityInfo.result.data.id,
    }
  });
  if (!deletedAirdrop) {
    throw new Error("Airdrop not found");
  }
} 