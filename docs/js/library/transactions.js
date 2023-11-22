import { Contract } from 'ethers';
import { ERC1155ABI, ERC721ABI } from './abi.js';
export async function transferERC721(nft, recipient, provider) {
    const contract = new Contract(nft.address, ERC721ABI, await provider.getSigner());
    return await contract.transferFrom(nft.owner, recipient, nft.id);
}
export async function transferERC1155(nft, from, recipient, amount, provider) {
    const contract = new Contract(nft.address, ERC1155ABI, await provider.getSigner());
    return await contract.safeTransferFrom(from, recipient, nft.id, amount, "0x");
}
//# sourceMappingURL=transactions.js.map