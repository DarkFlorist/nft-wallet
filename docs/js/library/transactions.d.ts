import { BrowserProvider } from 'ethers';
import { ERC1155, ERC721 } from './identifyTokens.js';
export declare function transferERC721(nft: ERC721, recipient: string, provider: BrowserProvider): Promise<void>;
export declare function transferERC1155(nft: ERC1155, from: string, recipient: string, amount: bigint, provider: BrowserProvider): Promise<void>;
//# sourceMappingURL=transactions.d.ts.map