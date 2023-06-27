import { Signal, useComputed, useSignal } from '@preact/signals'
import { knownNetworks } from '../library/networks.js'
import { connectBrowserProvider, ProviderStore } from '../library/provider.js'
import { BlockInfo } from '../library/types.js'
import { EthereumAddress } from '../types/ethereumTypes.js'
import { serialize } from '../types/wireTypes.js'
import { Blockie } from './Blockie.js'
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
	const walletAddress = useComputed(() => provider.value ? provider.value.walletAddress : 0n)
	const blockieScale = useSignal(5)

	return (
		<div className='flex flex-col w-full sm:flex-row items-center justify-between gap-4 border-slate-400/30'>
			<h1 className='text-sm bg-white text-black py-2 px-4 font-mono'>NFT Sender</h1>
			<div className='flex gap-4 items-center justify-center w-min max-w-full px-4 sm:px-0 text-sm sm:text-md'>
				{provider.value ? (
					<>
						<div className='flex flex-col items-end justify-around h-10 w-full'>
							<p className='font-bold text-right w-min max-w-full truncate'>{serialize(EthereumAddress, provider.value.walletAddress)}</p>
							<span className='text-gray-400 text-sm w-max flex gap-1 items-center'>
								<svg width='1em' height='1em' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg' className='inline-block'><path fill='currentColor' d='M44 32h-2v-8a2 2 0 0 0-2-2H26v-6h2a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2v6H8a2 2 0 0 0-2 2v8H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-2v-6h12v6h-2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-2v-6h12v6h-2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-34 8H6v-4h4ZM22 8h4v4h-4Zm4 32h-4v-4h4Zm16 0h-4v-4h4Z' data-name='icons Q2'></path></svg>
								{displayNetwork.value}</span>
						</div >
						<Blockie address={walletAddress} scale={blockieScale} />
					</>
				) : (
					<>
						<p className='w-max'>No Wallet Connected</p>
						<Button onClick={() => connectBrowserProvider(provider, blockInfo)}>Connect</Button>
					</>
				)}
			</div>
		</div>
	)
}
