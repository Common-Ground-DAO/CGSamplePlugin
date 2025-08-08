import { isUserAdmin, validateCommunityData, validateUserData } from '~/lib/.server/cgDataUtils';
import { prisma } from '~/lib/.server/db';

const addressRegex = /^0x[a-fA-F0-9]{40}$/;

// API-only route - handles POST requests to create airdrops
export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const beneficiaryAddress = formData.get("beneficiaryAddress") as `0x${string}`;
  const tokenAddress = formData.get("tokenAddress") as `0x${string}`;
  const startTimeSeconds = formData.get("startTimeSeconds") as string;
  const endTimeSeconds = formData.get("endTimeSeconds") as string;
  const chainId = formData.get("chainId") as string;
  const contractAddress = formData.get("contractAddress") as `0x${string}`;
  const communityInfoRaw = formData.get("communityInfoRaw") as string;
  const userInfoRaw = formData.get("userInfoRaw") as string;

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

  if (!addressRegex.test(beneficiaryAddress)) {
    throw new Error("Invalid address");
  }
  if (!addressRegex.test(contractAddress)) {
    throw new Error("Invalid contract address");
  }
  if (!addressRegex.test(tokenAddress)) {
    throw new Error("Invalid token address");
  }

  // Todo: more / better validation, use json + joi instead of formData?

  const existingCount = await prisma.vesting.count({
    where: {
      communityId: communityInfo.result.data.id,
    }
  });
  
  if (existingCount >= 100) {
    throw new Error("You have reached the maximum number of vestings for this community.");
  }

  const { id: vestingId } = await prisma.vesting.create({
    data: {
      name,
      beneficiaryAddress,
      startTimeSeconds: parseInt(startTimeSeconds),
      endTimeSeconds: parseInt(endTimeSeconds),
      creatorId: userInfo.result.data.id,
      communityId: communityInfo.result.data.id,
      tokenAddress,
      chainId: parseInt(chainId),
      contractAddress,
    }
  });

  return ({ vestingId });
} 