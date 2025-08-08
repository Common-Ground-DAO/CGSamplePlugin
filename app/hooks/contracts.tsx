import { useCallback, useEffect, useMemo, useState } from "react";
import type { erc20Abi } from "viem";
import type { AirdropClaim__factory, LSP7Vesting__factory, VestingWallet__factory } from "~/contracts";
import type { lsp7DigitalAssetAbi } from "@lukso/lsp7-contracts/abi";
import type { lsp4DigitalAssetMetadataAbi } from "@lukso/lsp4-contracts/abi";
import { useChains } from "wagmi";

// Airdrop
let _airdropFactory: typeof AirdropClaim__factory | null = null;
export function useAirdropContractFactory() {
    const [factory, setFactory] = useState<typeof AirdropClaim__factory | null>(() => _airdropFactory);
    
    useEffect(() => {
        let mounted = true;
        if (factory) return;
        (async () => {
            const { AirdropClaim__factory } = await import("~/contracts");
            _airdropFactory = AirdropClaim__factory;
            if (mounted) {
                setFactory(() => AirdropClaim__factory);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    return factory;
}

export function useAirdropAbi() {
    const airdropContractFactory = useAirdropContractFactory();
    const [abi, setAbi] = useState<typeof AirdropClaim__factory["abi"] | null>(airdropContractFactory?.abi || null);

    useEffect(() => {
        if (!abi && airdropContractFactory) {
            setAbi(airdropContractFactory.abi);
        }
    }, [abi, airdropContractFactory]);

    return abi;
}

// Vesting
let _vestingFactory: typeof LSP7Vesting__factory | null = null;
export function useVestingContractFactory() {
    const [factory, setFactory] = useState<typeof LSP7Vesting__factory | null>(() => _vestingFactory);
    
    useEffect(() => {
        let mounted = true;
        if (factory) return;
        (async () => {
            const { LSP7Vesting__factory } = await import("~/contracts");
            _vestingFactory = LSP7Vesting__factory;
            if (mounted) {
                setFactory(() => LSP7Vesting__factory);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    return factory;
}

// Openzeppelin Vesting
let _openzeppelinVestingFactory: typeof VestingWallet__factory | null = null;
export function useOpenzeppelinVestingContractFactory() {
    const [factory, setFactory] = useState<typeof VestingWallet__factory | null>(() => _openzeppelinVestingFactory);
    
    useEffect(() => {
        let mounted = true;
        if (factory) return;
        (async () => {
            const { VestingWallet__factory } = await import("~/contracts");
            _openzeppelinVestingFactory = VestingWallet__factory;
            if (mounted) {
                setFactory(() => VestingWallet__factory);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    return factory;
}

export function useVestingAbi() {
    const vestingContractFactory = useVestingContractFactory();
    const [abi, setAbi] = useState<typeof LSP7Vesting__factory["abi"] | null>(vestingContractFactory?.abi || null);

    useEffect(() => {
        if (!abi && vestingContractFactory) {
            setAbi(vestingContractFactory.abi);
        }
    }, [abi, vestingContractFactory]);

    return abi;
}

// ERC20
let _erc20Abi: typeof erc20Abi | null = null;
export function useErc20Abi() {
    const [abi, setAbi] = useState<typeof erc20Abi | null>(_erc20Abi);

    useEffect(() => {
        if (abi) return;
        let mounted = true;
        (async () => {
            const { erc20Abi } = await import("viem");
            _erc20Abi = erc20Abi;
            if (mounted) {
                setAbi(erc20Abi);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    return abi;
}

let _lsp7Abi: typeof lsp7DigitalAssetAbi | null = null;
export function useLsp7Abi() {
    const [abi, setAbi] = useState<typeof lsp7DigitalAssetAbi | null>(_lsp7Abi);
    
    useEffect(() => {
        if (abi) return;
        let mounted = true;
        (async () => {
            const { lsp7DigitalAssetAbi } = await import("@lukso/lsp7-contracts/abi");
            _lsp7Abi = lsp7DigitalAssetAbi;
            if (mounted) {
                setAbi(lsp7DigitalAssetAbi);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    return abi;
}

let _lsp4Abi: typeof lsp4DigitalAssetMetadataAbi | null = null;
export function useLsp4Abi() {
    const [abi, setAbi] = useState<typeof lsp4DigitalAssetMetadataAbi | null>(_lsp4Abi);
    
    useEffect(() => {
        if (abi) return;
        let mounted = true;
        (async () => {
            const { lsp4DigitalAssetMetadataAbi } = await import("@lukso/lsp4-contracts/abi");
            _lsp4Abi = lsp4DigitalAssetMetadataAbi;
            if (mounted) {
                setAbi(lsp4DigitalAssetMetadataAbi);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    return abi;
}

export function useGetChainNameById() {
    const chains = useChains();

    const chainNameByChainId = useMemo(() => {
        return chains.reduce((acc, chain) => {
            acc.set(chain.id, chain.name);
            return acc;
        }, new Map<number, string>());
    }, [chains]);

    const getChainNameById = useCallback((chainId: number) => {
        return (chainId !== undefined && chainNameByChainId.get(chainId)) || "Unknown chain";
    }, [chainNameByChainId]);

    return getChainNameById;
}