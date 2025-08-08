import type { TokenData } from "~/hooks/token-data";
import { MdContentCopy } from "react-icons/md";
import { useGetChainNameById } from "~/hooks/contracts";

interface TokenMetadataDisplayProps {
  tokenData?: TokenData;
  tokenAddress?: `0x${string}`;
  chainId?: number;
  small?: boolean;
}

export default function TokenMetadataDisplay({ tokenData, chainId, tokenAddress, small }: TokenMetadataDisplayProps) {
  const getChainNameById = useGetChainNameById();

  if (!tokenData) {
    return <div className="p-4 text-gray-500 w-full max-w-full text-center">No contract data provided</div>;
  }

  if (!tokenData.isFetching && !tokenData.type) {
    return null;
  }

  if (tokenData.isFetching) {
    return (
      <div className="card bg-base-300 shadow-lg w-full max-w-full mb-4">
        <div className="card-body">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="text-sm text-gray-500">Loading token metadata...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-300 shadow-lg w-full max-w-full mb-4">
      <div className="card-body">
        <div className="flex flex-col">
          <div className="card-title">
            {tokenData.type === "erc20" ? tokenData.erc20Data?.name : tokenData.lsp7Data?.lsp4TokenName}
            <div className={`badge badge-sm badge-primary`}>
              {tokenData.type === "lsp7" ? 'LSP7' : 'ERC20'}
            </div>
            {chainId !== undefined && <div className="badge badge-sm badge-primary">{getChainNameById(chainId)}</div>}
          </div>
          <div className="text-xs text-gray-500 flex flex-row items-center font-mono">
            {tokenAddress?.substring(0, 6)}...{tokenAddress?.substring(tokenAddress.length - 4)}
            <button className="btn btn-ghost btn-xs" onClick={() => navigator.clipboard.writeText(tokenAddress || "")}>
              <MdContentCopy />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {/* Basic Token Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Symbol</label>
              <div className="text-lg font-mono">{tokenData.type === "lsp7" ? tokenData.lsp7Data?.lsp4TokenSymbol : tokenData.erc20Data?.symbol}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Decimals</label>
              <div className="text-lg">{tokenData.decimals ?? 'N/A'}</div>
            </div>
          </div>

          {tokenData.totalSupply !== undefined && !small && (
            <div>
              <label className="text-sm font-medium text-gray-500">Total Supply</label>
              <div className="text-lg font-mono">
                {tokenData.decimals !== undefined && (
                  <span className="text-sm">
                    {((tokenData.totalSupply || 0n) / (10n ** BigInt(tokenData.decimals || 0))).toLocaleString()} {tokenData.type === "lsp7" ? tokenData.lsp7Data?.lsp4TokenSymbol : tokenData.erc20Data?.symbol}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* LSP7 Specific Information */}
          {tokenData.type === "lsp7" && !small && (
            <div className="divider">LSP4 Digital Asset Metadata</div>
          )}

          {tokenData.type === "lsp7" && !small && tokenData.lsp7Data?.lsp4TokenType !== undefined && (
            <div>
              <label className="text-sm font-medium text-gray-500">LSP4 Token Type</label>
              <div className="text-lg">
                {tokenData.lsp7Data?.lsp4TokenType === 0n && <span className="badge badge-success">Token</span>}
                {tokenData.lsp7Data?.lsp4TokenType === 1n && <span className="badge badge-warning">NFT</span>}
                {tokenData.lsp7Data?.lsp4TokenType === 2n && <span className="badge badge-info">Collection</span>}
                {tokenData.lsp7Data?.lsp4TokenType > 2n && <span className="badge badge-neutral">Custom ({tokenData.lsp7Data?.lsp4TokenType})</span>}
              </div>
            </div>
          )}

          {tokenData.type === "lsp7" && !small && tokenData.lsp7Data?.lsp4Creators && tokenData.lsp7Data?.lsp4Creators.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-500">Creators</label>
              <div className="space-y-1">
                {tokenData.lsp7Data?.lsp4Creators.map((creator, index) => (
                  <div key={index} className="text-sm font-mono bg-slate-50 p-2 rounded">
                    {creator}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tokenData.type === "lsp7" && !small && tokenData.lsp7Data?.lsp4Metadata && (
            <div className="max-w-full">
              <label className="text-sm font-medium text-gray-500">Metadata</label>
              <div className="collapse collapse-arrow bg-slate-50">
                <input type="checkbox" />
                <div className="collapse-title text-sm font-medium">
                  View JSON Metadata
                </div>
                <div className="collapse-content text-xs max-h-56 overflow-auto">
                  <pre className="max-w-full max-h-56">
                    {JSON.stringify(tokenData.lsp7Data?.lsp4Metadata, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Debug Information */}
          {(tokenData.error || tokenData.lsp7Data?.errors?.otherError) && (
            <div className="alert alert-error">
              <span className="text-sm">
                {tokenData.error?.message || tokenData.lsp7Data?.errors?.otherError}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 