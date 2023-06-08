import { batch, Signal, useComputed, useSignal, useSignalEffect } from '@preact/signals'
import { getAddress } from 'ethers';
import { JSX } from 'preact/jsx-runtime';
import { connectBrowserProvider, ProviderStore } from '../library/provider.js';
import { itentifyAddress } from '../library/identifyTokens.js'
import { BlockInfo } from '../library/types.js';
import { Button } from './Button.js';
import { TokenPicker } from './TokenPicker.js';
import { transferNft } from '../library/transactions.js';
import Blockie from './Blockie.js';
import { knownNetworks } from '../library/networks.js'
import { BlockieTextInput, NumberInput, TextInput } from './Inputs.js';

export const Transfer = ({ provider, blockInfo }: { provider: Signal<ProviderStore | undefined>, blockInfo: Signal<BlockInfo> }) => {
	const showTokenPicker = useSignal<boolean>(false)
	const selectedNft = useSignal<{ address: string, id: bigint, owner: string, name?: string, symbol?: string, tokenURI?: string } | undefined>(undefined)

	const fetchingStates = useSignal<'empty' | 'fetching' | 'notfound' | 'badid' | 'noprovider' | 'EOA' | 'contract' | 'ERC20' | 'ERC1155' | 'opensea'>('empty')
	const openseaParseError = useSignal<string>('')
	const sendText = useComputed(() => {
		if (!selectedNft.value) return 'Input Token Details'
		if (selectedNft.value.owner !== provider.value?.walletAddress) return 'You do not own this token'
		if (!recipient.value) return 'Missing Recipient'
		if (recipient.value === provider.value.walletAddress) return 'Cannot send to yourself'
		if (recipient.value === selectedNft.value.address) return 'Cannot send to the NFT contract'
		return 'Send'
	})

	const idInput = useSignal<number | undefined>(undefined)
	const showWarn = useSignal<{ id: boolean, recipient: boolean, contract: boolean }>({ id: false, recipient: false, contract: false })

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
					idInput.value = Number(id)
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
			console.log(event.currentTarget.value)
			showWarn.value = { ...showWarn.peek(), id: itemId.value === undefined && idInput.value !== undefined }
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
			const identifiedAddress = await itentifyAddress(address, id, provider.value?.provider)
			if (identifiedAddress.address === contractAddress.value && identifiedAddress.inputId === itemId.value) {
				if (identifiedAddress.type === 'ERC721') {
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
		if (selectedNft.value && recipient.value && provider.value) {
			transferNft(selectedNft.value, recipient.value, provider.value.provider)
		}
	}

	return (
		<div className='flex flex-col gap-4 w-full max-w-screen-xl'>
			<TokenPicker show={showTokenPicker} nft={selectedNft} />
			<h2 className='text-3xl font-semibold'>Transfer NFTs</h2>
			<div className='flex gap-4 flex-col sm:flex-row'>
				<TextInput warn={showWarn.value.contract} onInput={validateAddressInput} size='w-full' label='Contract Address' placeholder='0x133...789 or OpenSea Item URL https://opensea.io/assets/...' />
				<NumberInput warn={showWarn.value.id} label='Token ID' placeholder='1' input={idInput} onInput={validateIdInput} />
			</div>
			{fetchingStates.value === 'empty' ? null : (
				<div className='flex flex-row flex-wrap border border-white/50 p-4 h-max gap-4'>
					{fetchingStates.value === 'fetching' && !openseaParseError.value ?
						<>
							<div className='flex flex-col gap-4 flex-1 w-full max-w-xl'>
								<div>
									<span className='text-sm text-white/50'>Collection Name</span>
									{selectedNft.value ? <p className='truncate w-full'>{selectedNft.value.name}</p> : <p className='w-18 h-4 rounded bg-white/20 animate-pulse'></p>}
								</div>
								<div>
									<span className='text-sm text-white/50'>Token ID</span>
									{selectedNft.value ? <p className='truncate w-full'>{selectedNft.value.id}</p> : <p className='w-18 h-4 rounded bg-white/20 animate-pulse'></p>}
								</div>
								<div className='w-full'>
									<span className='text-sm text-white/50'>Token Metadata</span>
									{selectedNft.value ? <a className='truncate w-full block hover:underline' target='_blank' href={selectedNft.value.tokenURI}>{selectedNft.value.tokenURI}</a> : <p className='w-18 h-4 rounded bg-white/20 animate-pulse'></p>}
								</div>
							</div>
							<div className='flex flex-col gap-4 flex-1 w-full max-w-xl'>
								<div>
									<span className='text-sm text-white/50'>Contract Address</span>
									{selectedNft.value ? <span className='truncate w-full flex items-center gap-2'><Blockie seed={selectedNft.value.address.toLowerCase()} size={4} />{selectedNft.value.address}</span> : <p className='w-18 h-4 rounded bg-white/20 animate-pulse'></p>}
								</div>
								<div>
									<span className='text-sm text-white/50'>Owner</span>
									{selectedNft.value ? <span className='truncate w-full flex items-center gap-2'><Blockie seed={selectedNft.value.owner.toLowerCase()} size={4} />{selectedNft.value.owner}</span> : <p className='w-18 h-4 rounded bg-white/20 animate-pulse'></p>}
								</div>
							</div>
						</>
						: null}
					{openseaParseError.value ? <p>{openseaParseError.value}</p> : null}
					{fetchingStates.value === 'notfound' || fetchingStates.value === 'contract' ? <p>No NFT found at address</p> : null}
					{fetchingStates.value === 'badid' ? <p>Found NFT collection, but token ID does not exist</p> : null}
					{fetchingStates.value === 'noprovider' ? <p>Connect wallet to load token details.</p> : null}
					{fetchingStates.value === 'EOA' ? <p>Address provided is an EOA</p> : null}
					{fetchingStates.value === 'ERC20' ? <p>Address provided is an ERC20 contract</p> : null}
					{fetchingStates.value === 'ERC1155' ? <p>Address provided is an ERC1155 contract</p> : null}
				</div>)}
			<BlockieTextInput onInput={validateRecipientInput} label='Recipient Address' warn={showWarn.value.recipient} placeholder='0x133...789' />
			{provider.value
				? <Button variant='full' disabled={sendText.value !== 'Send'} onClick={sendTransfer}>{sendText.value}</Button>
				: <Button variant='full' onClick={() => connectBrowserProvider(provider, blockInfo)}>Connect Wallet</Button>
			}
		</div>
	)
}
