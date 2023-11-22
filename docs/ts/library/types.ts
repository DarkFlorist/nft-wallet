interface Eip1193Provider {
	request(request: { method: string; params?: Array<any> | Record<string, any> }): Promise<any>
	on(eventName: string | symbol, listener: (...args: any[]) => void): this
	removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this
}

declare global {
	interface Window {
		ethereum?: Eip1193Provider
	}
}

export type BlockInfo = { blockNumber: bigint; baseFee: bigint; priorityFee: bigint }
