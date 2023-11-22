import { Signal } from '@preact/signals';
import { Block, BrowserProvider } from 'ethers';
import { EthereumAddress } from '../types/ethereumTypes.js';
import { BlockInfo } from './types.js';
export type ProviderStore = {
    provider: BrowserProvider;
    _clearEvents: () => unknown;
    walletAddress: EthereumAddress;
    chainId: bigint;
};
export declare const connectBrowserProvider: (store: Signal<ProviderStore | undefined>, blockInfo: Signal<{
    blockNumber: bigint;
    baseFee: bigint;
    priorityFee: bigint;
}>) => Promise<void>;
export declare function updateLatestBlock(block: Block, provider: Signal<ProviderStore | undefined>, blockInfo: Signal<BlockInfo>): Promise<void>;
//# sourceMappingURL=provider.d.ts.map