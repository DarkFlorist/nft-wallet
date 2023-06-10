import { Contract, BrowserProvider } from 'ethers'
import { ERC721ABI } from './abi.js'
import { ERC721 } from './identifyTokens.js';

export async function transferERC721(nft: ERC721, recipient: string, provider: BrowserProvider) {
	const contract = new Contract(nft.address, ERC721ABI, await provider.getSigner())
	const tx = await contract.transferFrom(nft.owner, recipient, nft.id);
	await tx.wait()
}
