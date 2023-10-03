import { Signal, useSignal } from '@preact/signals'
export type Inactive = { state: 'inactive' }
export type Pending = { state: 'pending' }
export type Resolved<T> = { state: 'resolved'; value: T }
export type Rejected<E> = { state: 'rejected'; error: E }
export type AsyncProperty<T, E> = Inactive | Pending | Resolved<T> | Rejected<E>
export type AsyncState<T, E> = { value: Signal<AsyncProperty<T, E>>; waitFor: (resolver: () => Promise<T>) => void; reset: () => void }

export function useAsyncState<T, E = unknown>(): AsyncState<T, E> {
	function getCaptureAndCancelOthers() {
		// delete previously captured signal so any pending async work will no-op when they resolve
		delete captureContainer.peek().result
		// capture the signal in a new object so we can delete it later if it is interrupted
		captureContainer.value = { result }
		return captureContainer.peek()
	}

	async function activate(resolver: () => Promise<T>) {
		const capture = getCaptureAndCancelOthers()
		// we need to read the property out of the capture every time we look at it, in case it is deleted asynchronously
		function setCapturedResult(newResult: AsyncProperty<T, E>) {
			const result = capture.result
			if (result === undefined) return
			result.value = newResult
		}
		try {
			const pendingState = { state: 'pending' as const }
			setCapturedResult(pendingState)
			const resolvedValue = await resolver()
			const resolvedState = { state: 'resolved' as const, value: resolvedValue }
			setCapturedResult(resolvedState)
		} catch (unknownError: unknown) {
			const error = unknownError as E
			const rejectedState = { state: 'rejected' as const, error }
			setCapturedResult(rejectedState)
		}
	}

	function reset() {
		const result = getCaptureAndCancelOthers().result
		if (result === undefined) return
		result.value = { state: 'inactive' }
	}

	const result = useSignal<AsyncProperty<T, E>>({ state: 'inactive' })
	const captureContainer = useSignal<{ result?: Signal<AsyncProperty<T, E>> }>({})

	return { value: result, waitFor: resolver => activate(resolver), reset }
}
