import { batch, Signal, useComputed, useSignal, useSignalEffect } from '@preact/signals'
import { getAddress } from 'ethers'
import { connectBrowserProvider, ProviderStore } from '../library/provider.js'
import { itentifyAddress, ERC721, ERC1155 } from '../library/identifyTokens.js'
import { BlockInfo } from '../library/types.js'
import { Button } from './Button.js'
import { transferERC1155, transferERC721 } from '../library/transactions.js'
import { knownNetworks } from '../library/networks.js'
import { BlockieTextInput, NumberInput, TextInput, TokenAmountInput } from './Inputs.js'
import { ItemDetails } from './ItemDetails.js'
import { EthereumAddress } from '../types/ethereumTypes.js'
import { serialize } from '../types/wireTypes.js'

export const Transfer = ({ provider, blockInfo }: { provider: Signal<ProviderStore | undefined>, blockInfo: Signal<BlockInfo> }) => {
	const selectedNft = useSignal<ERC721 | ERC1155 | undefined>(undefined)

	// 'notfound' | 'badid' | 'noprovider' | 'EOA' | 'contract' | 'ERC20' | 'opensea'
	const fetchingStates = useSignal<'empty' | 'fetching' | 'complete'>('empty')

	const sendText = useComputed(() => {
		if (!selectedNft.value) return 'Input Token Details'
		if (selectedNft.value.type === 'ERC1155' && !transferAmount.value) return 'Missing transfer amount'
		if (!recipientAddress.value) return 'Missing Recipient'
		return 'Send'
	})

	const warning = useSignal<string | undefined>(undefined)

	// const errorMessages: { [error: string]: string } = {
	// 	notfound: 'No NFT found at address',
	// 	contract: 'No NFT found at address',
	// 	badid: 'Found NFT collection, but token ID does not exist',
	// 	noprovider: 'Connect wallet to load token details.',
	// 	EOA: 'Token address provided is an EOA',
	// 	ERC20: 'Token address provided is an ERC20 contract',
	// 	// if ('owner' in selectedNft.value && selectedNft.value.owner !== provider.value?.walletAddress) return 'You do not own this token'
	// 	// if (recipient.value === provider.value?.walletAddress) return 'Cannot send to yourself'
	// 	// if (recipient.value === selectedNft.value.address) return 'Cannot send to the NFT contract'
	// }

	const contractAddressInput = useSignal<string>('')
	const recipientInput = useSignal<string>('')
	const idInput = useSignal<string>('')
	const transferAmountInput = useSignal<string>('')

	useSignalEffect(() => {
		if (provider.value) {
			attemptToFetchNft(contractAddress.value, itemId.value)
		}
	})

	useSignalEffect(() => {
		if (contractAddressInput.value) {
			batch(() => {
				const openseaMatch = /^https?:\/\/opensea\.io\/assets\/([^\/]+)\/(0x[a-fA-F0-9]{40})\/(\d+)$/.exec(contractAddressInput.value)
				if (openseaMatch === null) {
					const value = contractAddressInput.value.toLowerCase().trim()
					contractAddress.value = /^0x[a-f0-9]*$/.test(value) && value.length === 42 ? getAddress(value) : undefined
				} else {
					// Parse OpenSea URL
					const [_, network, address, id] = openseaMatch
					const mappedNetwork = Object.keys(knownNetworks).reduce((match: string | undefined, chainId) => !match && knownNetworks[chainId].openseaSlug && knownNetworks[chainId].openseaSlug === network ? chainId : match, undefined)

					if (!mappedNetwork) {
						warning.value = 'NFT Sender doesn\'t recognize network from OpenSea URL'
						contractAddress.value = undefined
					} else if (BigInt(mappedNetwork) !== provider.value?.chainId) {
						warning.value = `The NFT on the provided URL is on ${knownNetworks[mappedNetwork].displayName}, please change your wallet's network to ${knownNetworks[mappedNetwork].displayName}`
						contractAddress.value = undefined
					} else {
						warning.value = undefined
						contractAddressInput.value = getAddress(address)
						contractAddress.value = getAddress(address)
						idInput.value = id
					}
				}
			})
		} else {
			contractAddress.value = undefined
		}
	})

	useSignalEffect(() => {
		if (idInput.value) {
			const value = idInput.value.trim()
			itemId.value = /^\d+$/.test(value) ? BigInt(value) : undefined
		} else {
			itemId.value = undefined
		}
	})

	useSignalEffect(() => {
		if (transferAmountInput.value) {
			const value = transferAmountInput.value.trim()
			let amount = /^\d+$/.test(value) ? BigInt(value) : undefined
			batch(() => {
				if (amount && selectedNft.value && selectedNft.value.type === 'ERC1155' && amount > selectedNft.value.balance) warning.value = 'Transfer amount is greater than your wallet\'s balance'
				transferAmount.value = amount
			})
		} else {
			transferAmount.value = undefined
		}
	})

	const recipientAddress = useComputed<string | undefined>(() => {
		if (!recipientInput.value) return undefined
		const value = recipientInput.value.toLowerCase().trim()
		return /^0x[a-f0-9]*$/.test(value) && value.length === 42 ? getAddress(value) : undefined
	})
	const contractAddress = useSignal<string | undefined>(undefined)
	const itemId = useSignal<bigint | undefined>(undefined)
	const transferAmount = useSignal<bigint | undefined>(undefined)

	const showWarn = useComputed<{ id: boolean, recipient: boolean, contract: boolean, amount: boolean }>(() => {
		const id = idInput.value !== '' && itemId.value === undefined
		const amount = transferAmountInput.value !== '' && transferAmount.value === undefined
		const recipient = recipientInput.value !== '' && recipientAddress.value === undefined
		const contract = contractAddressInput.value !== '' && contractAddress.value === undefined
		return { id, amount, recipient, contract }
	})

	async function attemptToFetchNft(address: string | undefined, id: bigint | undefined) {
		if (address === undefined || id === undefined) {
			return fetchingStates.value = 'empty'
		}
		selectedNft.value = undefined;
		if (!provider.value?.provider) {
			return warning.value = 'noprovider'
		}
		fetchingStates.value = 'fetching'
		try {
			const identifiedAddress = await itentifyAddress(address, id, provider.value?.provider, provider.value?.walletAddress)
			if (identifiedAddress.address === contractAddress.value && identifiedAddress.inputId === itemId.value) {
				if (identifiedAddress.type === 'ERC721') {
					selectedNft.value = identifiedAddress
				} else if (identifiedAddress.type === 'ERC1155') {
					selectedNft.value = identifiedAddress
				} else if (identifiedAddress.type === 'ERC20') {
					warning.value = 'Token address provided is an ERC20 contract'
				}
			}
		} catch (e) {
			console.log(e)
			if (typeof e === 'object' && e !== null && 'message' in e) {
				if (e.message === 'No ERC721 found at address') return warning.value = 'Invalid token ID for the provided ERC721'
				if (e.message === 'Token ID does not exist') return warning.value = 'badid'
			}
			return console.error(e)
		}
	}

	function sendTransfer() {
		if (selectedNft.value && recipientAddress.value && provider.value && selectedNft.value.type === 'ERC721') transferERC721(selectedNft.value, recipientAddress.value, provider.value.provider)
		if (selectedNft.value && recipientAddress.value && provider.value && transferAmount.value && selectedNft.value.type === 'ERC1155') transferERC1155(selectedNft.value, serialize(EthereumAddress, provider.value.walletAddress), recipientAddress.value, transferAmount.value, provider.value.provider)
	}

	return (
		<div className='flex flex-col gap-4 w-full max-w-screen-xl'>
			<h2 className='text-3xl font-semibold'>Transfer NFTs</h2>
			<div className='flex gap-4 flex-col sm:flex-row'>
				<TextInput warn={showWarn.value.contract} value={contractAddressInput} size='w-full' label='Contract Address' placeholder='0x133...789 or OpenSea Item URL https://opensea.io/assets/...' />
				<NumberInput warn={showWarn.value.id} label='Token ID' placeholder='1' value={idInput} />
			</div>
			{selectedNft.value?.type === 'ERC1155' ?
				<div className='flex gap-4 flex-col sm:flex-row'>
					<TokenAmountInput balance={selectedNft.value.balance} value={transferAmountInput} warn={showWarn.value.amount} label='Transfer Amount' size='w-full' placeholder='1' />
				</div>
				: null}
			{fetchingStates.value !== 'empty' ? (
				<div className='flex flex-row flex-wrap border border-white/50 p-4 h-max gap-4'>
					{fetchingStates.value === 'fetching' ? <ItemDetails item={selectedNft} /> : null}
				</div>
			) : null}
			<BlockieTextInput value={recipientInput} label='Recipient Address' warn={showWarn.value.recipient} placeholder='0x133...789' />
			{warning.value ? (
				<div class='flex items-center items-center border border-orange-400/50 bg-orange-400/10 px-4 py-2 gap-4'>
					ⓘ
					<div class='py-3 flex-grow'>
						<div>
							<strong>Warning:</strong> {warning}
						</div>
						<div class='leading-tight text-white/75 text-sm'>It is very likely sending this transaction will fail.</div>
					</div>
				</div>
			) : null}
			{provider.value
				? <Button variant='full' disabled={sendText.value !== 'Send'} onClick={sendTransfer}>{sendText.value}</Button>
				: <Button variant='full' onClick={() => connectBrowserProvider(provider, blockInfo)}>Connect Wallet</Button>
			}
		</div>
	)
}
