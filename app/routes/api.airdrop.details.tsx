import { prisma } from '~/lib/.server/db';
import type { Route } from './+types/api.airdrop.details';

// API-only route - handles POST requests to create airdrops
export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const airdropId = formData.get("airdropId") as string;
  if (!airdropId || typeof airdropId !== "string" || isNaN(parseInt(airdropId))) {
    return { error: "Airdrop ID is required and must be a string and a number" };
  }

  const airdropItems = await prisma.airdropItem.findMany({
    where: {
      airdropId: parseInt(airdropId)
    }
  });

  const merkleTree = await prisma.merkleTree.findUnique({
    where: {
      airdropId: parseInt(airdropId)
    }
  });

  return {
    airdropItems,
    merkleTree
  };
}