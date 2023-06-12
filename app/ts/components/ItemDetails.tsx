import { Signal } from '@preact/signals';
import { ERC721, ERC1155 } from '../library/identifyTokens.js'
import Blockie from './Blockie.js';

export const ItemDetails = ({ item }: { item: Signal<ERC721 | ERC1155 | undefined> }) => {
	// Loading State
	if (!item.value) return <><div className='flex flex-col gap-4 flex-1 w-full max-w-xl'>
		<div>
			<span className='text-sm text-white/50'>Collection Name</span>
			<p className='w-18 h-4 rounded bg-white/20 animate-pulse'></p>
		</div>
		<div>
			<span className='text-sm text-white/50'>Token ID</span>
			<p className='w-18 h-4 rounded bg-white/20 animate-pulse'></p>
		</div>
		<div className='w-full'>
			<span className='text-sm text-white/50'>Token Metadata</span>
			<p className='w-18 h-4 rounded bg-white/20 animate-pulse'></p>
		</div>
	</div>
		<div className='flex flex-col gap-4 flex-1 w-full max-w-xl'>
			<div>
				<span className='text-sm text-white/50'>Contract Address</span>
				<p className='w-18 h-4 rounded bg-white/20 animate-pulse'></p>
			</div>
			<div>
				<span className='text-sm text-white/50'>Owner</span>
				<p className='w-18 h-4 rounded bg-white/20 animate-pulse'></p>
			</div>
		</div>
	</>

	// ERC1155
	if (item.value.type === 'ERC1155') return (<>
		<div className='flex flex-col gap-4 flex-1 w-full max-w-xl'>
			<div>
				<span className='text-sm text-white/50'>Token Type</span>
				<p className='truncate w-full'>ERC1155</p>
			</div>
			<div>
				<span className='text-sm text-white/50'>Your Balance</span>
				<p className='truncate w-full'>{item.value.balance}</p>
			</div>
			{item.value.tokenURI ? (<div className='w-full'>
				<span className='text-sm text-white/50'>Token Metadata</span>
				<a className='truncate w-full block hover:underline' target='_blank' href={item.value.tokenURI}>{item.value.tokenURI}</a>
			</div>) : null}
		</div>
		<div className='flex flex-col gap-4 flex-1 w-full max-w-xl'>
			<div>
				<span className='text-sm text-white/50'>Contract Address</span>
				<span className='truncate w-full flex items-center gap-2'><Blockie seed={item.value.address.toLowerCase()} size={4} />{item.value.address}</span>
			</div>
			<div>
				<span className='text-sm text-white/50'>Token ID</span>
				<p className='truncate w-full'>{item.value.id}</p>
			</div>
		</div>
	</>
	)

	// ERC721
	return (<>
		<div className='flex flex-col gap-4 flex-1 w-full max-w-xl'>
			<div>
				<span className='text-sm text-white/50'>Collection Name</span>
				<p className='truncate w-full'>{item.value.name}</p>
			</div>
			<div>
				<span className='text-sm text-white/50'>Token Type</span>
				<p className='truncate w-full'>ERC721</p>
			</div>
			{item.value.tokenURI ? (<div className='w-full'>
				<span className='text-sm text-white/50'>Token Metadata</span>
				<a className='truncate w-full block hover:underline' target='_blank' href={item.value.tokenURI}>{item.value.tokenURI}</a>
			</div>) : null}
		</div>
		<div className='flex flex-col gap-4 flex-1 w-full max-w-xl'>
			<div>
				<span className='text-sm text-white/50'>Contract Address</span>
				<span className='truncate w-full flex items-center gap-2'><Blockie seed={item.value.address.toLowerCase()} size={4} />{item.value.address}</span>
			</div>
			<div>
				<span className='text-sm text-white/50'>Owner</span>
				<span className='truncate w-full flex items-center gap-2'><Blockie seed={item.value.owner.toLowerCase()} size={4} />{item.value.owner}</span>
			</div>
			<div>
				<span className='text-sm text-white/50'>Token ID</span>
				<p className='truncate w-full'>{item.value.id}</p>
			</div>
		</div>
	</>)
}
