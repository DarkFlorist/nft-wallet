import { useSignal } from "@preact/signals"
import { ProviderStore } from "./library/provider.js"
import { BlockInfo } from "./library/types.js"


export function createGlobalState() {
	const provider = useSignal<ProviderStore | undefined>(undefined)
	const blockInfo = useSignal<BlockInfo>({ blockNumber: 0n, baseFee: 0n, priorityFee: 10n ** 9n * 3n })

	return { provider, blockInfo }
}
