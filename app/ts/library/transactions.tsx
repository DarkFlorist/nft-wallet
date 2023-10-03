import { TransactionResponse } from 'ethers';
import { Contract, BrowserProvider } from 'ethers'
import { ERC1155ABI, ERC721ABI } from './abi.js'
import { humanReadableEthersError } from './humanEthersErrors.js';
import { ERC1155, ERC721 } from './identifyTokens.js'

export async function transferERC721(nft: ERC721, recipient: string, provider: BrowserProvider): Promise<TransactionResponse> {
	const contract = new Contract(nft.address, ERC721ABI, await provider.getSigner())
	try {
		return await contract.transferFrom(nft.owner, recipient, nft.id);
	} catch (ethersError) {
		throw humanReadableEthersError(ethersError)
	}
}

export async function transferERC1155(nft: ERC1155, from: string, recipient: string, amount: bigint, provider: BrowserProvider): Promise<TransactionResponse> {
	const contract = new Contract(nft.address, ERC1155ABI, await provider.getSigner())
	try {
		return await contract.safeTransferFrom(from, recipient, nft.id, amount, "0x");
	} catch (ethersError) {
		throw humanReadableEthersError(ethersError)
	}
}
