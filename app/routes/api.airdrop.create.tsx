import { isUserAdmin, validateCommunityData, validateUserData } from '~/lib/.server/cgDataUtils';
import { prisma } from '~/lib/.server/db';

// API-only route - handles POST requests to create airdrops
export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const tokenAddress = formData.get("tokenAddress") as string;
  const chainId = formData.get("chainId") as string;
  const airdropAddress = formData.get("airdropAddress") as string;
  const communityInfoRaw = formData.get("communityInfoRaw") as string;
  const userInfoRaw = formData.get("userInfoRaw") as string;
  const items = JSON.parse(formData.get("items") as string || "[]");
  const tree = JSON.parse(formData.get("tree") as string || "null");

  // Todo: validate items === tree.leaves?

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
  if (items.length === 0 || tree === null) {
    throw new Error("No items or tree to create an airdrop with");
  }

  const existingCount = await prisma.airdrop.count({
    where: {
      communityId: communityInfo.result.data.id,
    }
  });
  
  if (existingCount >= 10) {
    throw new Error("You have reached the maximum number of airdrops for this community.");
  }

  const { id: airdropId } = await prisma.airdrop.create({
    data: {
      name,
      creatorId: userInfo.result.data.id,
      communityId: communityInfo.result.data.id,
      tokenAddress,
      chainId: parseInt(chainId),
      airdropAddress,
      items: {
        createMany: {
          data: items
        }
      }
    }
  });

  if (tree) {
    await prisma.merkleTree.create({
      data: {
        airdropId,
        data: tree
      }
    });
  }

  return ({ airdropId });
} 