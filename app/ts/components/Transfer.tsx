import { batch, Signal, useComputed, useSignal, useSignalEffect } from '@preact/signals'
import { getAddress } from 'ethers';
import { JSX } from 'preact/jsx-runtime';
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

	const fetchingStates = useSignal<'empty' | 'fetching' | 'notfound' | 'badid' | 'noprovider' | 'EOA' | 'contract' | 'ERC20' | 'opensea'>('empty')
	const openseaParseError = useSignal<string>('')
	const sendText = useComputed(() => {
		if (!selectedNft.value) return 'Input Token Details'
		if ('owner' in selectedNft.value && selectedNft.value.owner !== provider.value?.walletAddress) return 'You do not own this token'
		if (!recipient.value) return 'Missing Recipient'
		if (recipient.value === provider.value?.walletAddress) return 'Cannot send to yourself'
		if (recipient.value === selectedNft.value.address) return 'Cannot send to the NFT contract'
		return 'Send'
	})

	const errorMessages: { [error: string]: string } = {
		notfound: 'No NFT found at address',
		contract: 'No NFT found at address',
		badid: 'Found NFT collection, but token ID does not exist',
		noprovider: 'Connect wallet to load token details.',
		EOA: 'Address provided is an EOA',
		ERC20: 'Address provided is an ERC20 contract',
	}

	const idInput = useSignal<string | undefined>(undefined)
	const transferAmount = useSignal<bigint | undefined>(undefined)
	const transferAmountInput = useSignal<string | undefined>(undefined)
	const showWarn = useSignal<{ id: boolean, recipient: boolean, contract: boolean, amount: boolean }>({ id: false, recipient: false, contract: false, amount: false })

	const contractAddress = useSignal<string | undefined>(undefined)
	const itemId = useSignal<bigint | undefined>(undefined)
	const recipient = useSignal<string | undefined>(undefined)

	useSignalEffect(() => {
		if (provider.value) {
			attemptToFetchNft(contractAddress.value, itemId.value)
		}
	})

	function validateAddressInput(event: JSX.TargetedEvent<HTMLInputElement>) {
		const openseaMatch = /^https?:\/\/opensea\.io\/assets\/([^\/]+)\/(0x[a-fA-F0-9]{40})\/(\d+)$/.exec(event.currentTarget.value)
		if (openseaMatch === null) {
			const value = event.currentTarget.value.toLowerCase().trim()
			batch(() => {
				openseaParseError.value = ''
				contractAddress.value = /^0x[a-f0-9]*$/.test(value) && value.length === 42 ? getAddress(value) : undefined
				showWarn.value = { ...showWarn.peek(), contract: contractAddress.value === undefined && Boolean(value) }
			})
		} else {
			// Parse OpenSea URL
			const [_, network, address, id] = openseaMatch
			const mappedNetwork = Object.keys(knownNetworks).reduce((match: string | undefined, chainId) => !match && knownNetworks[chainId].openseaSlug && knownNetworks[chainId].openseaSlug === network ? chainId : match, undefined)

			if (!mappedNetwork) {
				batch(() => {
					fetchingStates.value = 'opensea'
					openseaParseError.value = 'NFT Sender doesn\'t recognize network from OpenSea'
				})
			} else if (BigInt(mappedNetwork) !== provider.value?.chainId) {
				batch(() => {
					fetchingStates.value = 'opensea'
					openseaParseError.value = `The NFT on the provided URL is on ${knownNetworks[mappedNetwork].displayName}, please change your wallet's network to ${knownNetworks[mappedNetwork].displayName}`
				})
			} else {
				batch(() => {
					openseaParseError.value = ''
					contractAddress.value = getAddress(address)
					itemId.value = BigInt(id)
					idInput.value = id
					event.currentTarget.value = address
				})
			}
		}
	}

	function validateRecipientInput(event: JSX.TargetedEvent<HTMLInputElement>) {
		const value = event.currentTarget.value.toLowerCase().trim()
		batch(() => {
			recipient.value = /^0x[a-f0-9]*$/.test(value) && value.length === 42 ? getAddress(value) : undefined
			showWarn.value = { ...showWarn.peek(), recipient: recipient.value === undefined && Boolean(value) }
		})
	}

	function validateIdInput(event: JSX.TargetedEvent<HTMLInputElement>) {
		const value = event.currentTarget.value.toLowerCase().trim()
		batch(() => {
			itemId.value = /^\d+$/.test(value) ? BigInt(value) : undefined
			showWarn.value = { ...showWarn.peek(), id: itemId.value === undefined && idInput.value !== undefined }
		})
	}

	function validateAmountInput(event: JSX.TargetedEvent<HTMLInputElement>) {
		const value = event.currentTarget.value.toLowerCase().trim()
		let amount = /^\d+$/.test(value) ? BigInt(value) : undefined
		if (amount && amount < 0n) {
			amount = undefined
			event.currentTarget.value = ''
		}
		batch(() => {
			transferAmount.value = amount
			showWarn.value = { ...showWarn.peek(), amount: (transferAmount === undefined && transferAmountInput.value !== undefined) }
		})
	}

	async function attemptToFetchNft(address: string | undefined, id: bigint | undefined) {
		if (address === undefined || id === undefined) {
			return fetchingStates.value = 'empty'
		}
		selectedNft.value = undefined;
		if (!provider.value?.provider) {
			return fetchingStates.value = 'noprovider'
		}
		fetchingStates.value = 'fetching'
		try {
			const identifiedAddress = await itentifyAddress(address, id, provider.value?.provider, provider.value?.walletAddress)
			if (identifiedAddress.address === contractAddress.value && identifiedAddress.inputId === itemId.value) {
				if (identifiedAddress.type === 'ERC721') {
					selectedNft.value = identifiedAddress
				} else if (identifiedAddress.type === 'ERC1155') {
					selectedNft.value = identifiedAddress
				} else {
					fetchingStates.value = identifiedAddress.type
				}
			}
		} catch (e) {
			if (typeof e === 'object' && e !== null && 'message' in e) {
				if (e.message === 'No ERC721 found at address') return fetchingStates.value = 'notfound'
				if (e.message === 'Token ID does not exist') return fetchingStates.value = 'badid'
			}
			return console.error(e)
		}
	}

	function sendTransfer() {
		if (selectedNft.value && recipient.value && provider.value && selectedNft.value.type === 'ERC721') transferERC721(selectedNft.value, recipient.value, provider.value.provider)
		if (selectedNft.value && recipient.value && provider.value && transferAmount.value && selectedNft.value.type === 'ERC1155') transferERC1155(selectedNft.value, provider.value.walletAddress, recipient.value, transferAmount.value, provider.value.provider)
	}

	return (
		<div className='flex flex-col gap-4 w-full max-w-screen-xl'>
			{/* <TokenPicker show={showTokenPicker} nft={selectedNft} /> */}
			<h2 className='text-3xl font-semibold'>Transfer NFTs</h2>
			<div className='flex gap-4 flex-col sm:flex-row'>
				<TextInput warn={showWarn.value.contract} onInput={validateAddressInput} size='w-full' label='Contract Address' placeholder='0x133...789 or OpenSea Item URL https://opensea.io/assets/...' />
				<NumberInput warn={showWarn.value.id} label='Token ID' placeholder='1' input={idInput} onInput={validateIdInput} />
			</div>
			{selectedNft.value?.type === 'ERC1155' ?
				<div className='flex gap-4 flex-col sm:flex-row'>
					<TokenAmountInput balance={selectedNft.value.balance} onInput={validateAmountInput} input={transferAmountInput} warn={showWarn.value.amount} label='Transfer Amount' size='w-full' placeholder='1' />
				</div>
				: null}
			{fetchingStates.value === 'empty' ? null : (
				<div className='flex flex-row flex-wrap border border-white/50 p-4 h-max gap-4'>
					{fetchingStates.value === 'fetching' && !openseaParseError.value ? <ItemDetails item={selectedNft} /> : null}
					{openseaParseError.value ? <p>{openseaParseError.value}</p> : null}
					{fetchingStates.value in errorMessages ? <p>{errorMessages[fetchingStates.value]}</p> : null}
				</div>)}
			<BlockieTextInput onInput={validateRecipientInput} label='Recipient Address' warn={showWarn.value.recipient} placeholder='0x133...789' />
			{provider.value
				? <Button variant='full' disabled={sendText.value !== 'Send'} onClick={sendTransfer}>{sendText.value}</Button>
				: <Button variant='full' onClick={() => connectBrowserProvider(provider, blockInfo)}>Connect Wallet</Button>
			}
		</div>
	)
}
