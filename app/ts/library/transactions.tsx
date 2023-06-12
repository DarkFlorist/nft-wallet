import { Contract, BrowserProvider } from 'ethers'
import { ERC1155ABI, ERC721ABI } from './abi.js'
import { ERC1155, ERC721 } from './identifyTokens.js';

export async function transferERC721(nft: ERC721, recipient: string, provider: BrowserProvider) {
	const contract = new Contract(nft.address, ERC721ABI, await provider.getSigner())
	const tx = await contract.transferFrom(nft.owner, recipient, nft.id);
	await tx.wait()
}

export async function transferERC1155(nft: ERC1155, from: string, recipient: string, amount: bigint, provider: BrowserProvider) {
	const contract = new Contract(nft.address, ERC1155ABI, await provider.getSigner())
	const tx = await contract.safeTransferFrom(from, recipient, nft.id, amount, "0x");
	await tx.wait()
}
