import { prisma } from '~/lib/.server/db';

// API-only route - handles POST requests to create airdrops
export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const communityId = formData.get("communityId") as string;
  if (!communityId || typeof communityId !== "string") {
    return { error: "Community ID is required and must be a string" };
  }

  const airdrops = await prisma.airdrop.findMany({
    where: {
      communityId
    }
  });

  return airdrops;
} 