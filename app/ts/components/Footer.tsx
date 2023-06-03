export const Footer = () => (
	<footer className='mt-auto w-full  max-w-screen-xl'>
		<div className='flex flex-col sm:flex-row w-full gap-6 justify-around items-center'>
			<div className='flex flex-col gap-2'>
				<h2 className='font-semibold'>Contact</h2>
				<a href='https://discord.com/invite/aCSKcvf5VW' target='_blank' className='hover:underline text-white/50'>Discord</a>
				<a href='https://twitter.com/DarkFlorist' target='_blank' className='hover:underline text-white/50'>Twitter</a>
				<a href='https://github.com/DarkFlorist/TheInterceptor' target='_blank' className='hover:underline text-white/50'>Github</a>
			</div>
			<div className='flex flex-col gap-2'>
				<h2 className='font-semibold'>Our other tools</h2>
				<a href='https://dark.florist/' className='hover:underline text-white/50'>The Interceptor</a>
				<a href='https://lunaria.dark.florist/' className='hover:underline text-white/50'>Lunaria</a>
				<a href='https://bouquet.dark.florist/' className='hover:underline text-white/50'>Bouquet</a>
			</div>
		</div>
		<div className='flex items-center justify-center font-xs py-8 sm:py-6'><img src='/favicon.png' className='h-12' /><p className='hidden sm:block'>NFT Sender by <a href='https://dark.florist' className='hover:underline'>DarkFlorist</a></p></div>
	</footer>
)
