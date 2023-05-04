import { Signal, useSignal } from "@preact/signals";
import { connectBrowserProvider, ProviderStore } from "../library/provider.js";
import { BlockInfo } from "../library/types.js";
import { Button } from "./Button.js";
import { TokenPicker } from "./TokenPicker.js";

export const Transfer = ({ provider, blockInfo }: { provider: Signal<ProviderStore | undefined>, blockInfo: Signal<BlockInfo> }) => {
	const showTokenPicker = useSignal<boolean>(false)

	function transferNft() { }


	return (
		<div className="flex flex-col gap-4 w-full max-w-screen-xl">
			<TokenPicker show={showTokenPicker} />
			<h2 className="text-4xl font-semibold">Transfer</h2>
			<div className="flex gap-4">
				<div className="flex flex-col gap-4 flex-grow">
					<Button variant="full" onClick={() => showTokenPicker.value = true}>Select NFT</Button>
					<div className="flex flex-col border border-white/50 p-2 focus-within:bg-white/20">
						<span className="text-sm text-white/50">Collection Name</span>
						<p>No NFT Selected</p>
						<span className="text-sm text-white/50">Contract Address</span>
						<p>No NFT Selected</p>
						<span className="text-sm text-white/50">Token ID</span>
						<p>No NFT Selected</p>
					</div>
				</div>
				<div className="bg-white/20 w-64 sm:w-96"> </div>
			</div>
			<div className="flex flex-col border border-white/50 p-2 focus-within:bg-white/20">
				<span className="text-sm text-white/50">Recipient Address</span>
				<input type="text" className="bg-transparent outline-none placeholder:text-gray-600" placeholder="0x133...789" />
			</div>
			{provider.value
				? <Button variant="full" onClick={transferNft}>Send</Button>
				: <Button variant="full" onClick={() => connectBrowserProvider(provider, blockInfo)}>Connect Wallet</Button>
			}
		</div>
	)
}
