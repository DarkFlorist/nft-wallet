import { Provider } from "ethers";
import { EthereumAddress } from "../types/ethereumTypes.js";
type EOA = {
    type: 'EOA';
    address: string;
};
type UnknownContract = {
    type: 'contract';
    address: string;
};
type ERC20 = {
    type: 'ERC20';
    address: string;
    name: string;
    symbol: string;
    decimals: bigint;
    totalSupply: bigint;
};
export type ERC721 = {
    type: 'ERC721';
    address: string;
    owner: string;
    id: bigint;
    name?: string;
    symbol?: string;
    tokenURI?: string;
};
export type ERC1155 = {
    type: 'ERC1155';
    address: string;
    tokenURI?: string;
    balance: bigint;
    id: bigint;
};
export type IdentifiedAddress = (EOA | ERC20 | ERC721 | ERC1155 | UnknownContract) & {
    inputId: bigint;
};
export type SupportedToken = (ERC721 | ERC1155) & {
    inputId: bigint;
};
export declare function itentifyAddress(address: string, id: bigint, provider: Provider, user: EthereumAddress): Promise<IdentifiedAddress[]>;
export {};
//# sourceMappingURL=identifyTokens.d.ts.map