import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "preact/jsx-runtime";
import { useComputed, useSignal } from '@preact/signals';
import { knownNetworks } from '../library/networks.js';
import { connectBrowserProvider } from '../library/provider.js';
import { EthereumAddress } from '../types/ethereumTypes.js';
import { serialize } from '../types/wireTypes.js';
import { Blockie } from './Blockie.js';
import { Button } from './Button.js';
export const Navbar = ({ blockInfo, provider, }) => {
    const displayNetwork = useComputed(() => {
        if (!provider.value)
            return '';
        const chainId = `0x${provider.value.chainId.toString(16)}`;
        return chainId in knownNetworks ? knownNetworks[chainId].displayName : `Network ${provider.value.chainId.toString(10)}`;
    });
    const walletAddress = useComputed(() => provider.value ? provider.value.walletAddress : 0n);
    const blockieScale = useSignal(5);
    return (_jsxs("div", { className: 'flex flex-col w-full sm:flex-row items-center justify-between gap-4 border-slate-400/30', children: [_jsx("h1", { className: 'text-sm bg-white text-black py-2 px-4 font-mono', children: "NFT Sender" }), _jsx("div", { className: 'flex gap-4 items-center justify-center w-min max-w-full px-4 sm:px-0 text-sm sm:text-md', children: provider.value ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: 'flex flex-col items-end justify-around h-10 w-full', children: [_jsx("p", { className: 'font-bold text-right w-min max-w-full truncate', children: serialize(EthereumAddress, provider.value.walletAddress) }), _jsxs("span", { className: 'text-gray-400 text-sm w-max flex gap-1 items-center', children: [_jsx("svg", { width: '1em', height: '1em', viewBox: '0 0 48 48', xmlns: 'http://www.w3.org/2000/svg', className: 'inline-block', children: _jsx("path", { fill: 'currentColor', d: 'M44 32h-2v-8a2 2 0 0 0-2-2H26v-6h2a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2v6H8a2 2 0 0 0-2 2v8H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-2v-6h12v6h-2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-2v-6h12v6h-2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-34 8H6v-4h4ZM22 8h4v4h-4Zm4 32h-4v-4h4Zm16 0h-4v-4h4Z', "data-name": 'icons Q2' }) }), displayNetwork.value] })] }), _jsx(Blockie, { address: walletAddress, scale: blockieScale })] })) : (_jsxs(_Fragment, { children: [_jsx("p", { className: 'w-max', children: "No Wallet Connected" }), _jsx(Button, { onClick: () => connectBrowserProvider(provider, blockInfo), children: "Connect" })] })) })] }));
};
//# sourceMappingURL=Navbar.js.map