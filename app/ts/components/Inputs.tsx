import { Signal, useComputed, useSignal } from '@preact/signals';
import { getAddress } from 'ethers';
import { EthereumAddress } from '../types/ethereumTypes.js';
import { Blockie } from './Blockie.js';

export const NumberInput = ({ label, placeholder, size, warn, value }: { label: string, placeholder: string, warn?: boolean, size?: 'w-full' | 'w-max' | string, value: Signal<string | undefined> }) => (
	<div className={`${size ?? ''} flex flex-col justify-center border ${warn ? 'border-red-400' : 'border-white/50 focus-within:border-white/80'} h-16 bg-transparent outline-none focus-within:bg-white/5 px-4 bg-transparent`} >
		<span className='text-sm text-white/50 leading-tight'>{label}</span>
		<input {...{ placeholder, onInput: (e) => value.value = e.currentTarget.value, value: value.value }} type='number' className='h-6 bg-transparent outline-none placeholder:text-white/20' />
	</div>
)

export const TextInput = ({ label, placeholder, size, warn, value }: { label: string, placeholder: string, warn?: boolean, size?: 'w-full' | 'w-max' | string, value: Signal<string | undefined> }) => (
	<div className={`${size ?? ''} flex flex-col justify-center border ${warn ? 'border-red-400' : 'border-white/50 focus-within:border-white/80'} h-16 bg-transparent outline-none focus-within:bg-white/5 px-4 bg-transparent`} >
		<span className='text-sm text-white/50 leading-tight'>{label}</span>
		<input {...{ placeholder, onInput: (e) => value.value = e.currentTarget.value, value: value.value }} type='text' className='h-6 bg-transparent outline-none placeholder:text-white/20' />
	</div>
)

export const BlockieTextInput = ({ label, placeholder, size, warn, value }: { label: string, placeholder: string, warn?: boolean, size?: 'w-full' | 'w-max' | string, value: Signal<string | undefined> }) => {
	const parsedAddress = useComputed(() => {
		if (warn || !value.value || value.value.length !== 42) return 0n
		const parsed = EthereumAddress.safeParse(getAddress(value.value.toLowerCase()))
		return parsed.success ? parsed.value : 0n
	})
	const blockieSize = useSignal(2)

	return (
		<div className={`${size ?? ''} flex flex-col justify-center border ${warn ? 'border-red-400' : 'border-white/50 focus-within:border-white/80'} h-16 bg-transparent outline-none focus-within:bg-white/5 px-4 bg-transparent`} >
			<span className='text-sm text-white/50 leading-tight'>{label}</span>
			<div className='w-full flex gap-2 items-center'>
				{!warn && value.value ? <Blockie address={parsedAddress} scale={blockieSize} /> : null}
				<input {...{ placeholder, onInput: (e) => value.value = e.currentTarget.value, value: value.value }} type='text' className='grow h-6 bg-transparent outline-none placeholder:text-white/20' />
			</div>
		</div >
	)
}

export const TokenAmountInput = ({ label, placeholder, value, size, warn, balance }: { label: string, balance: bigint, placeholder: string, warn?: boolean, size?: 'w-full' | 'w-max' | string, value: Signal<string | undefined> }) => (
	<div className={`${size ?? ''} flex flex-wrap justify-center border ${warn ? 'border-red-400' : 'border-white/50 focus-within:border-white/80'} bg-transparent outline-none focus-within:bg-white/5 px-4 bg-transparent`} >
		<div className='flex flex-col h-16 flex-grow justify-center'>
			<span className='text-sm text-white/50'>{label}</span>
			<input {...{ placeholder, onInput: (e) => value.value = e.currentTarget.value, value: value.value }} type='number' className='h-6 bg-transparent outline-none placeholder:text-white/20' />
		</div>
		<div className='flex gap-2 items-center h-16'>
			<span className='text-sm text-white/70'>Balance: {balance}</span>
			<button className='p-2 outline-none border border-white/50 focus:border-white text-xs text-white/50 focus:text-white hover:text-white hover:border-white disabled:opacity-50' onClick={() => value.value = String(balance)}>Max</button>
		</div>
	</div>
)
