import { Signal, useComputed, useSignal, useSignalEffect } from "@preact/signals";
import { getAddress } from "ethers";
import { JSX } from "preact/jsx-runtime";
import { connectBrowserProvider, ProviderStore } from "../library/provider.js";
import { detectNft } from "../library/identifyTokens.js"
import { BlockInfo } from "../library/types.js";
import { Button } from "./Button.js";
import { TokenPicker } from "./TokenPicker.js";
import { transferNft } from "../library/transactions.js";
import Blockie from "./Blockie.js";

export const Transfer = ({ provider, blockInfo }: { provider: Signal<ProviderStore | undefined>, blockInfo: Signal<BlockInfo> }) => {
	const showTokenPicker = useSignal<boolean>(false)
	const selectedNft = useSignal<{ address: string, id: bigint, owner: string, name: string | undefined, tokenURI: string | undefined } | undefined>(undefined)

	const fetchingStates = useSignal<'empty' | 'fetching' | 'notfound' | 'badid' | 'noprovider'>('empty')
	const sendText = useComputed(() => {
		if (!selectedNft.value) return 'Input Token Details'
		if (selectedNft.value.owner !== provider.value?.walletAddress) return 'You do not own this token'
		if (!recipientInput.value) return 'Missing Recipient'
		if (recipientInput.value === provider.value.walletAddress) return 'Cannot send to yourself'
		if (recipientInput.value === selectedNft.value.address) return 'Cannot send to NFT contract'
		return 'Send'
	})

	const addressInput = useSignal<string | undefined>(undefined)
	const idInput = useSignal<bigint | undefined>(undefined)
	const recipientInput = useSignal<string | undefined>(undefined)

	useSignalEffect(() => {
		attemptToFetchNft(addressInput.value, idInput.value)
	})

	function validateAddressInput(event: JSX.TargetedEvent<HTMLInputElement>) {
		try {
			addressInput.value = getAddress(event.currentTarget.value.toLowerCase())
		} catch (e) {
			console.error(e)
			addressInput.value = undefined
		}
	}

	function validateRecipientInput(event: JSX.TargetedEvent<HTMLInputElement>) {
		try {
			recipientInput.value = getAddress(event.currentTarget.value.toLowerCase())
		} catch (e) {
			console.error(e)
			recipientInput.value = undefined
		}
	}

	function validateIdInput(event: JSX.TargetedEvent<HTMLInputElement>) {
		try {
			idInput.value = BigInt(event.currentTarget.value)
		} catch (e) {
			console.error(e)
			idInput.value = undefined
		}
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
			const nft = await detectNft(address, id, provider.value?.provider)
			if (nft.address === addressInput.value && nft.id === idInput.value) {
				return selectedNft.value = nft
			}
		} catch (e: any) {
			if ('message' in e) {
				if (e.message === 'No ERC721 found at address') return fetchingStates.value = 'notfound'
				if (e.message === 'Token ID does not exist') return fetchingStates.value = 'badid'
			}
			return console.error(e)
		}
	}

	function sendTransfer() {
		if (selectedNft.value && recipientInput.value && provider.value) {
			transferNft(selectedNft.value, recipientInput.value, provider.value.provider)
		}
	}

	return (
		<div className="flex flex-col gap-4 w-full max-w-screen-xl">
			<TokenPicker show={showTokenPicker} nft={selectedNft} />
			<h2 className="text-2xl font-semibold">Transfer NFTs</h2>
			<div className="flex gap-4 flex-col sm:flex-row">
				<div className="flex flex-col flex-grow border border-white/50 p-2 bg-black focus-within:bg-white/20">
					<span className="text-sm text-white/50">Contract Address</span>
					<input onInput={validateAddressInput} type="text" className="bg-transparent outline-none placeholder:text-gray-600" placeholder="0x133...789" />
				</div>
				<div className="flex flex-col border border-white/50 p-2 bg-black focus-within:bg-white/20">
					<span className="text-sm text-white/50">Token ID</span>
					<input onInput={validateIdInput} type="number" className="bg-transparent outline-none placeholder:text-gray-600" placeholder="1" />
				</div>
			</div>
			{fetchingStates.value === 'empty' ? null : (
				<div className="flex flex-row flex-wrap border border-white/50 p-4 h-max gap-4">
					{fetchingStates.value === 'fetching' ?
						<>
							<div className="flex flex-col gap-4 flex-1">
								<div>
									<span className="text-sm text-white/50">Collection Name</span>
									{selectedNft.value ? <p>{selectedNft.value.name}</p> : <p className="w-18 h-4 rounded bg-white/20 animate-pulse"></p>}
								</div>
								<div>
									<span className="text-sm text-white/50">Token ID</span>
									{selectedNft.value ? <p>{selectedNft.value.id}</p> : <p className="w-18 h-4 rounded bg-white/20 animate-pulse"></p>}
								</div>
								<div>
									<span className="text-sm text-white/50">Token Metadata</span>
									{selectedNft.value ? <a className="block hover:underline" target="_blank" href={selectedNft.value.tokenURI}>{selectedNft.value.tokenURI}</a> : <p className="w-18 h-4 rounded bg-white/20 animate-pulse"></p>}
								</div>
							</div>
							<div className="flex flex-col gap-4 flex-1">
								<div>
									<span className="text-sm text-white/50">Contract Address</span>
									{selectedNft.value ? <span className="flex items-center gap-2"><Blockie seed={selectedNft.value.address.toLowerCase()} size={4} />{selectedNft.value.address}</span> : <p className="w-18 h-4 rounded bg-white/20 animate-pulse"></p>}
								</div>
								<div>
									<span className="text-sm text-white/50">Owner</span>
									{selectedNft.value ? <span className="flex items-center gap-2"><Blockie seed={selectedNft.value.owner.toLowerCase()} size={4} />{selectedNft.value.owner}</span> : <p className="w-18 h-4 rounded bg-white/20 animate-pulse"></p>}
								</div>
							</div>
						</>
						: null}
					{fetchingStates.value === 'notfound' ? <p>No NFT found at address</p> : null}
					{fetchingStates.value === 'badid' ? <p>Found NFT collection, but token ID does not exist</p> : null}
					{fetchingStates.value === 'noprovider' ? <p>Connect wallet to load token details.</p> : null}
				</div>)}
			<div className="flex flex-col border border-white/50 p-2 focus-within:bg-white/20">
				<span className="text-sm text-white/50">Recipient Address</span>
				<input onInput={validateRecipientInput} type="text" className="bg-transparent outline-none placeholder:text-gray-600" placeholder="0x133...789" />
			</div>
			{provider.value
				? <Button variant="full" disabled={sendText.value !== 'Send'} onClick={sendTransfer}>{sendText.value}</Button>
				: <Button variant="full" onClick={() => connectBrowserProvider(provider, blockInfo)}>Connect Wallet</Button>
			}
		</div>
	)
}
