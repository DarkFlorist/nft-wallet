import { Contract, Provider, Interface, ZeroAddress, BytesLike } from "ethers"
import { EthereumAddress } from "../types/ethereumTypes.js"
import { serialize } from "../types/wireTypes.js"
import { ERC1155ABI, ERC20ABI, ERC721ABI, MulticallABI } from './abi.js'

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

export type ERC721 = {
	type: 'ERC721'
	address: string
	owner: string
	id: bigint
	name?: string
	symbol?: string
	tokenURI?: string
}

export type ERC1155 = {
	type: 'ERC1155'
	address: string
	tokenURI?: string
	balance: bigint
	id: bigint
}

export type IdentifiedAddress = (EOA | ERC20 | ERC721 | ERC1155 | UnknownContract) & { inputId: bigint }

export async function itentifyAddress(address: string, id: bigint, provider: Provider, user: EthereumAddress): Promise<IdentifiedAddress> {
	const contractCode = await provider.getCode(address)
	if (contractCode === '0x') return { type: 'EOA', address, inputId: id }

	const multicall = new Contract('0x5ba1e12693dc8f9c48aad8770482f4739beed696', MulticallABI, provider)
	const nftInterface = new Interface(ERC721ABI)
	const erc20Interface = new Interface(ERC20ABI)
	const erc1155Interface = new Interface(ERC1155ABI)

	const calls = [
		{
			target: address,
			callData: nftInterface.encodeFunctionData('supportsInterface', ['0x80ac58cd']) // Is ERC721
		},
		{
			target: address,
			callData: nftInterface.encodeFunctionData('supportsInterface', ['0x5b5e139f']) // Is ERC721Metadata
		},
		{
			target: address,
			callData: nftInterface.encodeFunctionData('supportsInterface', ['0xd9b67a26']) // Is ERC1155
		},
		{
			target: address,
			callData: nftInterface.encodeFunctionData('supportsInterface', ['0x0e89341c']) // Is ERC1155Metadata
		},
		{
			target: address,
			callData: nftInterface.encodeFunctionData('ownerOf', [id])
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
		},
		{
			target: address,
			callData: erc1155Interface.encodeFunctionData('uri', [id])
		}
	]

	const [isERC721, hasMetadata, isERC1155, isERC1155Metadata, owner, name, symbol, decimals, totalSupply, tokenURI, erc1155Uri]: { success: boolean, returnData: BytesLike }[] = await multicall.tryAggregate.staticCall(false, calls)

	try {

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

		if (isERC1155.success && nftInterface.decodeFunctionResult('supportsInterface', isERC1155.returnData)[0] === true) {
			const tokenContract = new Contract(address, ERC1155ABI, provider)
			const userAddress = serialize(EthereumAddress, user)
			const balance = await tokenContract.balanceOf(userAddress, id)
			const uri: string | undefined = erc1155Uri.success && isERC1155Metadata.success && erc1155Interface.decodeFunctionResult('supportsInterface', isERC1155Metadata.returnData)[0] === true ? erc1155Interface.decodeFunctionResult('uri', erc1155Uri.returnData)[0] : undefined
			return {
				type: 'ERC1155',
				inputId: id,
				id,
				address,
				balance,
				tokenURI: uri ? uri.replaceAll(`{id}`, id.toString(10)) : undefined,
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
