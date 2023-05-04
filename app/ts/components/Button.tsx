const classNames = {
	primary: 'border-white/50 border bg-white/10 text-white px-6 py-2 w-max focus:bg-white/20 disabled:bg-slate-600 disabled:cursor-not-allowed',
	full: 'border-white/50 border bg-white/10 text-white px-6 py-4 w-full focus:bg-white/20 disabled:bg-slate-600 disabled:cursor-not-allowed',
}

export const Button = ({
	children,
	disabled,
	variant,
	onClick,
}: {
	children: string
	disabled?: boolean
	variant?: 'primary' | 'full'
	onClick: () => unknown
}) => {
	return (
		<button onClick={onClick} disabled={disabled ?? false} className={classNames[variant ?? 'primary']}>
			{children}
		</button>
	)
}
