import { Navbar } from './Navbar.js'
import { createGlobalState } from '../stores.js'
import { Transfer } from './Transfer.js'

export function App() {
	const state = createGlobalState()

	return (
		<main class='bg-black text-primary w-full min-h-screen sm:p-4 p-6 gap-4 font-serif flex flex-col items-center'>
			<Navbar {...state} />
			<Transfer {...state} />
		</main>
	)
}
