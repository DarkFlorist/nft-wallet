import { Signal, useSignal } from "@preact/signals";
import { getAddress } from "ethers"

export const TokenPicker = ({ show, nft }: { show: Signal<boolean>, nft: Signal<{ address: string, id: bigint, owner: string, name: string | undefined, tokenURI: string | undefined }> }) => {
	const results = useSignal<Array<{ name: string, id: bigint, contract: string }>>([])

	const addressInput = useSignal<string | undefined>()
	const idInput = useSignal<bigint | undefined>()

	function validateAddressInput(event) {
		if (event.target.value) {
			try {
				addressInput.value = getAddress(event.target.value)
			} catch (error) {
				console.log(error)
				addressInput.value = undefined
			}
		}
	}

	if (!show.value) return null
	else return (
		<div className="bg-black/90 w-full h-full inset-0 fixed p-4 flex flex-col items-center">
			<button className="ml-auto font-bold text-2xl" onClick={() => show.value = false}>x</button>
			<div className="flex flex-col gap-4 max-w-screen-xl w-full">
				<h2 className="font-semibold text-2xl">Select NFT {addressInput.value ?? 'eeee'}</h2>
				<div className="flex gap-4">
					<div className="flex flex-col flex-grow border border-white/50 p-2 bg-black">
						<span className="text-sm text-white/50">Contract Address</span>
						<input onInput={validateAddressInput} type="text" className="bg-transparent outline-none placeholder:text-gray-600" placeholder="0x133...789" />
					</div>
					<div className="flex flex-col border border-white/50 p-2 bg-black">
						<span className="text-sm text-white/50">Token ID</span>
						<input type="number" className="bg-transparent outline-none placeholder:text-gray-600" placeholder="1" />
					</div>
				</div>
				<div>
					{results.value.map(result => (
						<div class="bg-neutral-800 relative group h-64 w-64 p-4 flex flex-col justify-end">
							<button className="hidden group-hover:block h-64 w-64 inset-0 absolute bg-black/80 border border-white/50 font-semibold">
								Select Item
							</button>
							<h2 className="font-semibold text-xl">{result.name}</h2>
							<h3 className="text-gray-400">#{result.id.toString()}</h3>
						</div>))}
				</div>
			</div>
		</div>
	)
}
