import { Signal } from '@preact/signals';
import { JSX } from 'preact/jsx-runtime';
export declare const TokenPicker: ({ show }: {
    show: Signal<boolean>;
    nft: Signal<{
        address: string;
        id: bigint;
        owner: string;
        name?: string;
        symbol?: string;
        tokenURI?: string;
    } | undefined>;
}) => JSX.Element | null;
//# sourceMappingURL=TokenPicker.d.ts.map