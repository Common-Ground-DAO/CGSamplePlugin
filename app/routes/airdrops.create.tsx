import AirdropCreate from "../views/airdrop-create/airdrop-create";

export function meta() {
  return [
    { title: "Create new Airdrop" },
    { name: "description", content: "Create a new airdrop merkle tree and deploy it to the blockchain" },
  ];
}

export default function CreateAirdrop() {
  return <AirdropCreate />;
} 