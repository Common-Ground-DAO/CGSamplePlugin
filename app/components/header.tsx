import type { CommunityInfoResponsePayload } from "@common-ground-dao/cg-plugin-lib";
import { IoChevronDown } from "react-icons/io5";
import { useAccount, useConnect, useDisconnect, useSwitchChain, useChains } from "wagmi";
import { useCgData } from "~/context/cg_data";
import { Button } from "./Button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./Dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select";
import { cn } from "tailwind-variants";

export default function Header() {
  const { communityInfo } = useCgData();

  return (
    <div className="p-4 flex gap-2 justify-between flex-wrap">
      <div className="flex flex-row items-center justify-start gap-3">
        {!!communityInfo && <CommunityInfo communityInfo={communityInfo} />}
      </div>
      <div className="flex flex-row items-center justify-end gap-2">
        <WalletConnect />
      </div>
    </div>
  );
}

function CommunityInfo({ communityInfo }: { communityInfo: CommunityInfoResponsePayload }) {
  if (!communityInfo.smallLogoUrl && !communityInfo.largeLogoUrl && !communityInfo.title) return null;

  return (<>
    <div className="rounded-xl w-10 h-10 overflow-hidden">
      <img src={communityInfo.smallLogoUrl || communityInfo.largeLogoUrl} />
    </div>
    <div className="text-xl font-bold">
      {communityInfo.title}
    </div>
  </>)
}

function ChainSwitcher() {
  const { chain } = useAccount();
  const { switchChain, isPending } = useSwitchChain();
  const chains = useChains();

  if (!chain) return null;

  return (
    <Select  value={chain.id.toString()} onValueChange={(value) => switchChain({ chainId: parseInt(value) })}>
      <SelectTrigger>
        {isPending ? "Switching..." : <SelectValue placeholder={chain.name}  />}
      </SelectTrigger>
      <SelectContent>
        {chains.map((availableChain) => (
          <SelectItem key={availableChain.id} value={availableChain.id.toString()}>
            {availableChain.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const installedWallets = connectors.filter(c => c.type === "injected");

  if (isConnected) {
    return (
      <div className="flex flex-row items-center gap-2">
        <ChainSwitcher />
        <p className="font-mono text-xs">Connected: {!address ? "Unknown" : `${address.slice(0, 6)}...${address.slice(-4)}`}</p>
        <Button
          variant="primary"
          onClick={() => disconnect()}
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Dialog >
      <DialogTrigger asChild>
        <Button
          variant="primary"
          onClick={() => (document.getElementById('my_modal_2') as any)?.showModal()}
        >
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="w-fit">
        <DialogHeader>
          <DialogTitle>Choose a wallet to connect</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <div className="flex flex-col gap-2 w-full pt-4">
            {installedWallets.map(c => (
              <Button key={c.id} variant="primary" className="w-full" onClick={() => connect({ connector: c })}>
                {c.name}
              </Button>
            ))}
            <DialogClose asChild>
              <Button variant="secondary" className="w-full">close</Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>

    </Dialog>);
}