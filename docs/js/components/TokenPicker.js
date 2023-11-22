import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { useSignal } from '@preact/signals';
import { getAddress } from 'ethers';
export const TokenPicker = ({ show }) => {
    const results = useSignal([]);
    const addressInput = useSignal(undefined);
    const idInput = useSignal(undefined);
    function validateAddressInput(event) {
        try {
            addressInput.value = getAddress(event.currentTarget.value.toLowerCase());
        }
        catch (error) {
            console.log(error);
            addressInput.value = undefined;
        }
    }
    function validateIdInput(event) {
        try {
            idInput.value = BigInt(event.currentTarget.value);
        }
        catch (error) {
            console.log(error);
            idInput.value = undefined;
        }
    }
    if (!show.value)
        return null;
    else
        return (_jsxs("div", { className: 'bg-black/90 w-full h-full inset-0 fixed p-4 flex flex-col items-center', children: [_jsx("button", { className: 'ml-auto font-bold text-2xl', onClick: () => show.value = false, children: "x" }), _jsxs("div", { className: 'flex flex-col gap-4 max-w-screen-xl w-full', children: [_jsx("h2", { className: 'font-semibold text-2xl', children: "Select NFT" }), _jsxs("div", { className: 'flex gap-4', children: [_jsxs("div", { className: 'flex flex-col flex-grow border border-white/50 p-2 bg-black', children: [_jsx("span", { className: 'text-sm text-white/50', children: "Contract Address" }), _jsx("input", { onInput: validateAddressInput, type: 'text', className: 'bg-transparent outline-none placeholder:text-gray-600', placeholder: '0x133...789' })] }), _jsxs("div", { className: 'flex flex-col border border-white/50 p-2 bg-black', children: [_jsx("span", { className: 'text-sm text-white/50', children: "Token ID" }), _jsx("input", { onInput: validateIdInput, type: 'number', className: 'bg-transparent outline-none placeholder:text-gray-600', placeholder: '1' })] })] }), _jsx("div", { children: results.value.map(result => (_jsxs("div", { class: 'bg-neutral-800 relative group h-64 w-64 p-4 flex flex-col justify-end', children: [_jsx("button", { className: 'hidden group-hover:block h-64 w-64 inset-0 absolute bg-black/80 border border-white/50 font-semibold', children: "Select Item" }), _jsx("h2", { className: 'font-semibold text-xl', children: result.name }), _jsxs("h3", { className: 'text-gray-400', children: ["#", result.id.toString()] })] }))) })] })] }));
};
//# sourceMappingURL=TokenPicker.js.map