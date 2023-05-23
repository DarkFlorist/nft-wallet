import { Signal, useComputed } from '@preact/signals'
import { knownNetworks } from '../library/networks.js'
import { connectBrowserProvider, ProviderStore } from '../library/provider.js'
import { BlockInfo } from '../library/types.js'
import Blockie from './Blockie.js'
import { Button } from './Button.js'

export const Navbar = ({
	blockInfo,
	provider,
}: {
	blockInfo: Signal<BlockInfo>,
	provider: Signal<ProviderStore | undefined>,
}) => {
	const displayNetwork = useComputed(() => {
		if (!provider.value) return ''
		const chainId = `0x${provider.value.chainId.toString(16)}`
		return chainId in knownNetworks ? knownNetworks[chainId].displayName : `Network ${provider.value.chainId.toString(10)}`
	})

	return (
		<div className='flex flex-col w-full sm:flex-row items-center justify-between gap-4 border-slate-400/30'>
			<h1 className='text-xl'>NFT Sender</h1>
			<div className='flex gap-4 items-center'>
				{provider.value ? (
					<>
						<div className='flex flex-col'>
							<p className='font-bold break-all'>{provider.value.walletAddress}</p>
							<span className='text-gray-400 text-sm'>{displayNetwork.value}</span>
						</div >
						<Blockie seed={provider.value.walletAddress.toLowerCase()} size={12} />
					</>
				) : (
					<>
						<p>No Wallet Connected</p>
						<Button onClick={() => connectBrowserProvider(provider, blockInfo)}>Connect</Button>
					</>
				)}
			</div>
		</div>
	)
}
