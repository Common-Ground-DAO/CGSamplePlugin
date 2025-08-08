import { useParams } from "react-router";
import type { Route } from "./+types/airdrops";
import AirdropView from "~/views/airdrop-view/airdrop-view";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Airdrop Manager" },
    { name: "description", content: "Check your airdrop status and claim your tokens" },
  ];
}

export default function Airdrops() {
  const { airdropId } = useParams();
  let airdropIdNumber: number | undefined;
  try {
    airdropIdNumber = airdropId ? parseInt(airdropId) : undefined;
  } catch (error) {
    console.error("Invalid airdropId", error);
  }

  return (
    <AirdropView airdropId={airdropIdNumber} />
  );
}
