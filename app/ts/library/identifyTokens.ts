import { Contract, Provider, Interface, ZeroAddress, BytesLike } from "ethers";
import { ERC721ABI, MulticallABI } from "./abi.js";

export async function detectNft(address: string, id: bigint, provider: Provider) {
	const multicall = new Contract('0x5ba1e12693dc8f9c48aad8770482f4739beed696', MulticallABI, provider)
	const nftInterface = new Interface(ERC721ABI)

	const calls = [
		{
			target: address,
			callData: nftInterface.encodeFunctionData('supportsInterface', ['0x80ac58cd']) // Is ERC721
		},
		{
			target: address,
			callData: nftInterface.encodeFunctionData('ownerOf', [id])
		},
		{
			target: address,
			callData: nftInterface.encodeFunctionData('supportsInterface', ['0x5b5e139f']) // Is ERC721Metadata
		},
		{
			target: address,
			callData: nftInterface.encodeFunctionData('name', [])
		},
		{
			target: address,
			callData: nftInterface.encodeFunctionData('tokenURI', [id])
		}
	]

	const [isERC721, owner, hasMetadata, name, tokenURI]: { success: boolean, returnData: BytesLike }[] = await multicall.tryAggregate.staticCall(false, calls)
	try {
		if (isERC721.success === false || nftInterface.decodeFunctionResult('supportsInterface', isERC721.returnData)[0] === false) throw new Error('No ERC721 found at address')
		if (owner.success === false || nftInterface.decodeFunctionResult('ownerOf', owner.returnData)[0] === ZeroAddress) throw new Error('No ERC721 found at address')
	} catch {
		// If any errors occur from deocoding returnData then it must not be ERC721
		throw new Error('No ERC721 found at address')
	}
	if (!owner.success) throw new Error('Token ID does not exist')
	return {
		address,
		id,
		owner: nftInterface.decodeFunctionResult('ownerOf', owner.returnData)[0],
		name: hasMetadata.success ? nftInterface.decodeFunctionResult('name', name.returnData)[0] : undefined,
		tokenURI: hasMetadata.success ? nftInterface.decodeFunctionResult('tokenURI', tokenURI.returnData)[0] : undefined,
	}
}
