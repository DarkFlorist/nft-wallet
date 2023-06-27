import { ProviderStore } from './library/provider.js';
import { BlockInfo } from './library/types.js';
export declare function createGlobalState(): {
    provider: import("@preact/signals-core").Signal<ProviderStore | undefined>;
    blockInfo: import("@preact/signals-core").Signal<BlockInfo>;
};
//# sourceMappingURL=stores.d.ts.map