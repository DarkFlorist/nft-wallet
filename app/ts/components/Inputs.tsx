import { JSX } from 'preact';
import { Signal } from '@preact/signals';
import Blockie from './Blockie.js';
import { useRef } from 'preact/hooks';

export const NumberInput = ({ label, placeholder, onInput, size, warn, input }: { label: string, placeholder: string, warn?: boolean, size?: 'w-full' | 'w-max' | string, input?: Signal<string | undefined>, onInput?: JSX.GenericEventHandler<HTMLInputElement> }) => (
	<div className={`${size ?? ''} flex flex-col justify-center border ${warn ? 'border-red-400' : 'border-white/50 focus-within:border-white/80'} h-16 bg-transparent outline-none focus-within:bg-white/5 px-4 bg-transparent`} >
		<span className='text-sm text-white/50 leading-tight'>{label}</span>
		<input {...{ placeholder, onInput, ...(input ? { value: input.value } : {}) }} type='number' className='h-6 bg-transparent outline-none placeholder:text-white/20' />
	</div>
)

export const TextInput = ({ label, placeholder, onInput, size, warn, input }: { label: string, placeholder: string, warn?: boolean, size?: 'w-full' | 'w-max' | string, input?: Signal<string | undefined>, onInput?: JSX.GenericEventHandler<HTMLInputElement> }) => (
	<div className={`${size ?? ''} flex flex-col justify-center border ${warn ? 'border-red-400' : 'border-white/50 focus-within:border-white/80'} h-16 bg-transparent outline-none focus-within:bg-white/5 px-4 bg-transparent`} >
		<span className='text-sm text-white/50 leading-tight'>{label}</span>
		<input {...{ placeholder, onInput, ...(input ? { value: input.value } : {}) }} type='text' className='h-6 bg-transparent outline-none placeholder:text-white/20' />
	</div>
)

export const BlockieTextInput = ({ label, placeholder, onInput, size, warn, input }: { label: string, placeholder: string, warn?: boolean, size?: 'w-full' | 'w-max' | string, input?: Signal<string | undefined>, onInput?: JSX.GenericEventHandler<HTMLInputElement> }) => {
	const inputRef = useRef<HTMLInputElement>(null)

	return (
		<div className={`${size ?? ''} flex flex-col justify-center border ${warn ? 'border-red-400' : 'border-white/50 focus-within:border-white/80'} h-16 bg-transparent outline-none focus-within:bg-white/5 px-4 bg-transparent`} >
			<span className='text-sm text-white/50 leading-tight'>{label}</span>
			<div className='w-full flex gap-2 items-center'>
				{!warn && inputRef.current && inputRef.current.value ? <Blockie seed={inputRef.current.value.toLowerCase()} size={4} /> : null}
				<input ref={inputRef} {...{ placeholder, onInput, ...(input ? { value: input.value } : {}) }} type='text' className='grow h-6 bg-transparent outline-none placeholder:text-white/20' />
			</div>
		</div >
	)
}
