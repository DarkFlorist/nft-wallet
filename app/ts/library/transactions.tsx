import { Contract, BrowserProvider } from 'ethers'
import { ERC721ABI } from './abi.js'

export async function transferNft(nft: { address: string, id: bigint, owner: string }, recipient: string, provider: BrowserProvider) {
	const contract = new Contract(nft.address, ERC721ABI, await provider.getSigner())
	const tx = await contract.transferFrom(nft.owner, recipient, nft.id);
	await tx.wait()
}
