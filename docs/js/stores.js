import { useSignal } from '@preact/signals';
export function createGlobalState() {
    const provider = useSignal(undefined);
    const blockInfo = useSignal({ blockNumber: 0n, baseFee: 0n, priorityFee: 10n ** 9n * 3n });
    return { provider, blockInfo };
}
//# sourceMappingURL=stores.js.map