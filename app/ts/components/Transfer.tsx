import { batch, Signal, useComputed, useSignal, useSignalEffect } from '@preact/signals'
import { getAddress } from 'ethers';
import { connectBrowserProvider, ProviderStore } from '../library/provider.js';
import { itentifyAddress, ERC721, ERC1155 } from '../library/identifyTokens.js'
import { BlockInfo } from '../library/types.js';
import { Button } from './Button.js';
import { transferERC1155, transferERC721 } from '../library/transactions.js';

import { knownNetworks } from '../library/networks.js'
import { BlockieTextInput, NumberInput, TextInput, TokenAmountInput } from './Inputs.js';
import { ItemDetails } from './ItemDetails.js';

export const Transfer = ({ provider, blockInfo }: { provider: Signal<ProviderStore | undefined>, blockInfo: Signal<BlockInfo> }) => {
	// const showTokenPicker = useSignal<boolean>(false)
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
		if (selectedNft.value && recipientAddress.value && provider.value && transferAmount.value && selectedNft.value.type === 'ERC1155') transferERC1155(selectedNft.value, provider.value.walletAddress, recipientAddress.value, transferAmount.value, provider.value.provider)
	}

	return (
		<div className='flex flex-col gap-4 w-full max-w-screen-xl'>
			{/* <TokenPicker show={showTokenPicker} nft={selectedNft} /> */}
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
					<svg width='1em' height='1em' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' className='text-4xl'>
						<path
							d='M12 17.5C12.3117 17.5 12.5731 17.3944 12.7843 17.1832C12.9948 16.9727 13.1 16.7117 13.1 16.4V11.9725C13.1 11.6608 12.9948 11.4042 12.7843 11.2025C12.5731 11.0008 12.3117 10.9 12 10.9C11.6883 10.9 11.4273 11.0052 11.2168 11.2157C11.0056 11.4269 10.9 11.6883 10.9 12V16.4275C10.9 16.7392 11.0056 16.9958 11.2168 17.1975C11.4273 17.3992 11.6883 17.5 12 17.5V17.5ZM12 8.7C12.3117 8.7 12.5731 8.5944 12.7843 8.3832C12.9948 8.17273 13.1 7.91167 13.1 7.6C13.1 7.28833 12.9948 7.0269 12.7843 6.8157C12.5731 6.60523 12.3117 6.5 12 6.5C11.6883 6.5 11.4273 6.60523 11.2168 6.8157C11.0056 7.0269 10.9 7.28833 10.9 7.6C10.9 7.91167 11.0056 8.17273 11.2168 8.3832C11.4273 8.5944 11.6883 8.7 12 8.7ZM12 23C10.4783 23 9.04833 22.7111 7.71 22.1332C6.37167 21.5561 5.2075 20.7725 4.2175 19.7825C3.2275 18.7925 2.44393 17.6283 1.8668 16.29C1.28893 14.9517 1 13.5217 1 12C1 10.4783 1.28893 9.04833 1.8668 7.71C2.44393 6.37167 3.2275 5.2075 4.2175 4.2175C5.2075 3.2275 6.37167 2.44357 7.71 1.8657C9.04833 1.28857 10.4783 1 12 1C13.5217 1 14.9517 1.28857 16.29 1.8657C17.6283 2.44357 18.7925 3.2275 19.7825 4.2175C20.7725 5.2075 21.5561 6.37167 22.1332 7.71C22.7111 9.04833 23 10.4783 23 12C23 13.5217 22.7111 14.9517 22.1332 16.29C21.5561 17.6283 20.7725 18.7925 19.7825 19.7825C18.7925 20.7725 17.6283 21.5561 16.29 22.1332C14.9517 22.7111 13.5217 23 12 23ZM12 20.8C14.4383 20.8 16.5148 19.9431 18.2293 18.2293C19.9431 16.5148 20.8 14.4383 20.8 12C20.8 9.56167 19.9431 7.48523 18.2293 5.7707C16.5148 4.0569 14.4383 3.2 12 3.2C9.56167 3.2 7.4856 4.0569 5.7718 5.7707C4.05727 7.48523 3.2 9.56167 3.2 12C3.2 14.4383 4.05727 16.5148 5.7718 18.2293C7.4856 19.9431 9.56167 20.8 12 20.8Z'
							fill='white'
						/>
					</svg>
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
