import { Contract, Provider, Interface, ZeroAddress, BytesLike } from "ethers";
import { ERC20ABI, ERC721ABI, MulticallABI } from "./abi.js";

type EOA = {
	type: 'EOA'
	address: string
}

type UnknownContract = {
	type: 'contract'
	address: string
}

type ERC20 = {
	type: 'ERC20'
	address: string
	name: string
	symbol: string
	decimals: bigint
	totalSupply: bigint
}

type ERC721 = {
	type: 'ERC721'
	address: string
	owner: string
	id: bigint
	name?: string
	symbol?: string
	tokenURI?: string
}

export type IdentifiedAddress = (EOA | ERC20 | ERC721 | UnknownContract) & { inputId: bigint }

export async function itentifyAddress(address: string, id: bigint, provider: Provider): Promise<IdentifiedAddress> {
	const contractCode = await provider.getCode(address)
	if (contractCode === '0x') return { type: 'EOA', address, inputId: id }

	const multicall = new Contract('0x5ba1e12693dc8f9c48aad8770482f4739beed696', MulticallABI, provider)
	const nftInterface = new Interface(ERC721ABI)
	const erc20Interface = new Interface(ERC20ABI)

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
			callData: erc20Interface.encodeFunctionData('name', [])
		},
		{
			target: address,
			callData: erc20Interface.encodeFunctionData('symbol', [])
		},
		{
			target: address,
			callData: erc20Interface.encodeFunctionData('decimals', [])
		},
		{
			target: address,
			callData: erc20Interface.encodeFunctionData('totalSupply', [])
		},
		{
			target: address,
			callData: nftInterface.encodeFunctionData('tokenURI', [id])
		}
	]

	try {

		const [isERC721, owner, hasMetadata, name, symbol, decimals, totalSupply, tokenURI]: { success: boolean, returnData: BytesLike }[] = await multicall.tryAggregate.staticCall(false, calls)

		if (isERC721.success && nftInterface.decodeFunctionResult('supportsInterface', isERC721.returnData)[0] === true) {
			if (owner.success === false || nftInterface.decodeFunctionResult('ownerOf', owner.returnData)[0] === ZeroAddress) throw new Error('No ERC721 found at address')
			return {
				type: 'ERC721',
				inputId: id,
				address,
				id,
				owner: nftInterface.decodeFunctionResult('ownerOf', owner.returnData)[0],
				name: hasMetadata.success ? nftInterface.decodeFunctionResult('name', name.returnData)[0] : undefined,
				tokenURI: hasMetadata.success ? nftInterface.decodeFunctionResult('tokenURI', tokenURI.returnData)[0] : undefined,
			}
		}

		if (name.success && decimals.success && symbol.success && totalSupply.success) {
			return {
				type: 'ERC20',
				inputId: id,
				address,
				name: erc20Interface.decodeFunctionResult('name', name.returnData)[0],
				symbol: erc20Interface.decodeFunctionResult('name', symbol.returnData)[0],
				decimals: BigInt(erc20Interface.decodeFunctionResult('decimals', decimals.returnData)[0]),
				totalSupply: erc20Interface.decodeFunctionResult('totalSupply', totalSupply.returnData)[0]
			}
		}

	} catch (error) {
		// For any reason decoding txing fails catch and return as unknown contract
		console.error(error)
		return { type: 'contract', address, inputId: id }
	}

	// If doesn't pass checks being an ERC20 or ERC721, then we only know its a contract
	return { type: 'contract', address, inputId: id }
}
