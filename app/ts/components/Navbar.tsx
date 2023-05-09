import { Signal } from '@preact/signals'
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
	return (
		<div className='flex flex-col w-full sm:flex-row items-center justify-between gap-4 border-slate-400/30'>
			<h1 className='font-extrabold text-2xl'>NFT Wallet</h1>
			<div className='flex gap-4 items-center'>
				{provider.value ? (
					<>
						<div className='flex flex-col items-end'>
							<p className='font-bold'>{provider.value.walletAddress}</p>
							<span className='text-gray-400 text-sm'>{provider.value.chainId === 1n ? 'Mainnet' : `Network ${provider.value.chainId.toString()}`}</span>
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
