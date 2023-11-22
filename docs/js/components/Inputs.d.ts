import { Signal } from '@preact/signals';
export declare const NumberInput: ({ label, placeholder, size, warn, value }: {
    label: string;
    placeholder: string;
    warn?: boolean | undefined;
    size?: string | undefined;
    value: Signal<string | undefined>;
}) => import("preact").JSX.Element;
export declare const TextInput: ({ label, placeholder, size, warn, value }: {
    label: string;
    placeholder: string;
    warn?: boolean | undefined;
    size?: string | undefined;
    value: Signal<string | undefined>;
}) => import("preact").JSX.Element;
export declare const BlockieTextInput: ({ label, placeholder, size, warn, value }: {
    label: string;
    placeholder: string;
    warn?: boolean | undefined;
    size?: string | undefined;
    value: Signal<string | undefined>;
}) => import("preact").JSX.Element;
export declare const TokenAmountInput: ({ label, placeholder, value, size, warn, balance }: {
    label: string;
    balance: bigint;
    placeholder: string;
    warn?: boolean | undefined;
    size?: string | undefined;
    value: Signal<string | undefined>;
}) => import("preact").JSX.Element;
//# sourceMappingURL=Inputs.d.ts.map