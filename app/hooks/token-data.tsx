import { INTERFACE_ID_LSP7, INTERFACE_ID_LSP7_PREVIOUS } from "@lukso/lsp7-contracts/constants";
import { useErc20Abi, useLsp4Abi, useLsp7Abi } from "./contracts";
import { useReadContract, usePublicClient, useConnectorClient } from "wagmi";
import { useCallback, useEffect, useMemo, useState } from "react";

export interface TokenData {
    isERC165?: boolean;
    type?: "erc20" | "lsp7";
    totalSupply?: bigint;
    decimals?: number;
    erc20Data?: ERC20Data;
    lsp7Data?: LSP7Data;
    isFetching?: boolean;
    error?: any;
}

export interface LSP7Data {
    lsp4TokenName?: string;
    lsp4TokenSymbol?: string;
    lsp4TokenType?: bigint;
    lsp4Metadata?: any;
    lsp4Creators?: string[];
    errors?: LSP7Errors;
}

interface LSP7Errors {
    lsp4TokenName?: any;
    lsp4TokenSymbol?: any;
    lsp4TokenType?: any;
    lsp4Metadata?: any;
    lsp4Creators?: any;
    otherError?: any;
}

export interface ERC20Data {
    name?: string;
    symbol?: string;
    errors?: ERC20Errors;
}

interface ERC20Errors {
    name?: any;
    symbol?: any;
}

export function useTokenData(address?: `0x${string}`, chainId?: number): TokenData {
    const erc20Abi = useErc20Abi();
    const lsp7Abi = useLsp7Abi();
    const lsp4Abi = useLsp4Abi();
    const client = usePublicClient({ chainId });
    const [tokenData, setTokenData] = useState<TokenData>({ isFetching: false });

    const analyzeContract = useCallback(async (caller: { mounted: boolean }) => {
        if (!client || !lsp4Abi || !lsp7Abi || !erc20Abi || !address || !caller.mounted) return;
        setTokenData({ isFetching: true });
        
        let isLSP7 = false;
        let isERC20 = false;
        let decimals: number | undefined;
        let totalSupply: bigint | undefined;
        const lsp7Data: LSP7Data = {};
        const erc20Data: ERC20Data = {};
        const newTokenData: TokenData = {
            isERC165: false,
            isFetching: false,
        };

        try {
            newTokenData.isERC165 = await client.readContract({
                address,
                abi: lsp4Abi,
                functionName: "supportsInterface",
                args: ["0x01ffc9a7"],
            });
        } catch (error) {
            console.info("Contract is not ERC165");
        }

        if (!caller.mounted) return;
        
        if (newTokenData.isERC165) {
            try {
                const [isLSP7_current, isLSP7_v0_12_0, isLSP7_v0_14_0, _isERC20] = await Promise.all([
                    client.readContract({
                        address,
                        abi: lsp4Abi,
                        functionName: "supportsInterface",
                        args: [INTERFACE_ID_LSP7],
                    }),
                    client.readContract({
                        address,
                        abi: lsp4Abi,
                        functionName: "supportsInterface",
                        args: [INTERFACE_ID_LSP7_PREVIOUS["v0.12.0"] as `0x${string}`],
                    }),
                    client.readContract({
                        address,
                        abi: lsp4Abi,
                        functionName: "supportsInterface",
                        args: [INTERFACE_ID_LSP7_PREVIOUS["v0.14.0"] as `0x${string}`],
                    }),
                    client.readContract({
                        address,
                        abi: lsp4Abi,
                        functionName: "supportsInterface",
                        args: ["0x36372b07"], // ERC20 interface ID
                    }),
                ]);

                isLSP7 = isLSP7_current || isLSP7_v0_12_0 || isLSP7_v0_14_0;
                isERC20 = _isERC20;
            } catch (error) {
                console.info("Contract is not LSP7");
            }
        }

        if (isLSP7) {
            try {
                // Dynamic import to avoid SSR issues
                const { ERC725 } = await import('@erc725/erc725.js');
                const lsp4Schema = await import('@erc725/erc725.js/schemas/LSP4DigitalAsset.json');
                if (!caller.mounted) return;

                const erc725js = new ERC725(
                    lsp4Schema.default || lsp4Schema,
                    address,
                    client.transport.url, // Use the RPC URL from the public client
                    {
                        // ipfsGateway: 'https://api.universalprofile.cloud/ipfs',
                        ipfsGateway: 'https://dweb.link/ipfs',
                    }
                );

                // Fetch all LSP4 data
                const [tokenName, tokenSymbol, tokenType, metadata, creators, decimalsResult, totalSupplyResult] = await Promise.allSettled([
                    erc725js.fetchData('LSP4TokenName'),
                    erc725js.fetchData('LSP4TokenSymbol'),
                    erc725js.fetchData('LSP4TokenType'),
                    erc725js.fetchData('LSP4Metadata'),
                    erc725js.fetchData('LSP4Creators[]'),
                    client.readContract({
                        address,
                        abi: lsp7Abi,
                        functionName: "decimals",
                    }),
                    client.readContract({
                        address,
                        abi: lsp7Abi,
                        functionName: "totalSupply",
                    }),
                ]);

                decimals = decimalsResult.status === 'fulfilled' ? decimalsResult.value : undefined;
                totalSupply = totalSupplyResult.status === 'fulfilled' ? totalSupplyResult.value : undefined;

                if (tokenName.status === 'fulfilled' && tokenName.value?.value !== undefined) {
                    lsp7Data.lsp4TokenName = String(tokenName.value.value);
                }
                if (tokenSymbol.status === 'fulfilled' && tokenSymbol.value?.value !== undefined) { 
                    lsp7Data.lsp4TokenSymbol = String(tokenSymbol.value.value);
                }
                if (tokenType.status === 'fulfilled' && tokenType.value?.value !== null && tokenType.value?.value !== undefined) {
                    lsp7Data.lsp4TokenType = BigInt(tokenType.value.value as any);
                }
                if (metadata.status === 'fulfilled' && metadata.value?.value) {
                    lsp7Data.lsp4Metadata = metadata.value.value;
                }
                if (creators.status === 'fulfilled' && Array.isArray(creators.value?.value)) {
                    lsp7Data.lsp4Creators = creators.value.value as string[];
                }

                if (tokenName.status === 'rejected') {
                    lsp7Data.errors = {
                        ...lsp7Data.errors,
                        lsp4TokenName: tokenName.reason,
                    };
                }
                if (tokenSymbol.status === 'rejected') {
                    lsp7Data.errors = {
                        ...lsp7Data.errors,
                        lsp4TokenSymbol: tokenSymbol.reason,
                    };
                }
                if (tokenType.status === 'rejected') {
                    lsp7Data.errors = {
                        ...lsp7Data.errors,
                        lsp4TokenType: tokenType.reason,
                    };
                }
                if (metadata.status === 'rejected') {
                    lsp7Data.errors = {
                        ...lsp7Data.errors,
                        lsp4Metadata: metadata.reason,
                    };
                }
                if (creators.status === 'rejected') {
                    lsp7Data.errors = {
                        ...lsp7Data.errors,
                        lsp4Creators: creators.reason,
                    };
                }

                if (decimals !== undefined && totalSupply !== undefined && tokenName.status === 'fulfilled' && tokenSymbol.status === 'fulfilled' && tokenType.status === 'fulfilled' && metadata.status === 'fulfilled' && creators.status === 'fulfilled') {
                    newTokenData.type = "lsp7";
                    newTokenData.decimals = decimals;
                    newTokenData.totalSupply = totalSupply;
                    newTokenData.lsp7Data = lsp7Data;
                }
            } catch (error) {
                console.warn("Error fetching LSP7 metadata:", error);
            }
        }
        else {
            try {
                if (!caller.mounted) return;

                const [decimalsResult, totalSupplyResult, name, symbol] = await Promise.allSettled([
                    client.readContract({
                        address,
                        abi: erc20Abi,
                        functionName: "decimals",
                    }),
                    client.readContract({
                        address,
                        abi: erc20Abi,
                        functionName: "totalSupply",
                    }),
                    client.readContract({
                        address,
                        abi: erc20Abi,
                        functionName: "name",
                    }),
                    client.readContract({
                        address,
                        abi: erc20Abi,
                        functionName: "symbol",
                    }),
                ]);

                decimals = decimalsResult.status === 'fulfilled' ? decimalsResult.value : undefined;
                totalSupply = totalSupplyResult.status === 'fulfilled' ? totalSupplyResult.value : undefined;

                if (name.status === 'fulfilled' && name.value) {
                    erc20Data.name = String(name.value);
                }
                if (symbol.status === 'fulfilled' && symbol.value) {
                    erc20Data.symbol = String(symbol.value);
                }

                if (decimals !== undefined && totalSupply !== undefined && name.status === 'fulfilled' && symbol.status === 'fulfilled') {
                    isERC20 = true;
                    newTokenData.type = "erc20";
                    newTokenData.decimals = decimals;
                    newTokenData.totalSupply = totalSupply;
                    newTokenData.erc20Data = erc20Data;
                }
            } catch (error) {
                console.warn("Error fetching ERC20 metadata:", error);
            }
        }

        if (!caller.mounted) return;
        setTokenData(newTokenData);
    }, [client, lsp4Abi, address, erc20Abi, lsp7Abi]);

    useEffect(() => {
        const helper = { mounted: true };
        analyzeContract(helper);
        return () => {
            helper.mounted = false;
        };
    }, [analyzeContract]);

    return tokenData;
}