import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { batch, useComputed, useSignal, useSignalEffect } from '@preact/signals';
import { getAddress } from 'ethers';
import { connectBrowserProvider } from '../library/provider.js';
import { itentifyAddress } from '../library/identifyTokens.js';
import { Button } from './Button.js';
import { transferERC1155, transferERC721 } from '../library/transactions.js';
import { knownNetworks } from '../library/networks.js';
import { BlockieTextInput, NumberInput, TextInput, TokenAmountInput } from './Inputs.js';
import { ItemDetails } from './ItemDetails.js';
import { EthereumAddress } from '../types/ethereumTypes.js';
import { serialize } from '../types/wireTypes.js';
import { useAsyncState } from '../library/asyncState.js';
import { SingleNotice } from './Notice.js';
import { humanReadableEthersError } from '../library/humanEthersErrors.js';
export const Transfer = ({ provider, blockInfo }) => {
    const selectedNft = useSignal(undefined);
    const selectedMultiAssets = useSignal({ assets: [], displayIndex: 0 });
    const fetchingStates = useSignal('empty');
    const sendText = useComputed(() => {
        if (!selectedNft.value)
            return 'Input Token Details';
        if (selectedNft.value.type === 'ERC1155' && !transferAmount.value)
            return 'Missing transfer amount';
        if (!recipientAddress.value)
            return 'Missing Recipient';
        return 'Send';
    });
    const warning = useSignal(undefined);
    const contractAddressInput = useSignal('');
    const recipientInput = useSignal('');
    const idInput = useSignal('');
    const transferAmountInput = useSignal('');
    function validateAddressInput() {
        batch(() => {
            const openseaMatch = /^https?:\/\/opensea\.io\/assets\/([^\/]+)\/(0x[a-fA-F0-9]{40})\/(\d+)$/.exec(contractAddressInput.value);
            if (openseaMatch === null) {
                const value = contractAddressInput.value.toLowerCase().trim();
                contractAddress.value = /^0x[a-f0-9]*$/.test(value) && value.length === 42 ? getAddress(value) : undefined;
                warning.value = undefined;
            }
            else {
                // Parse OpenSea URL
                const [_, network, address, id] = openseaMatch;
                const mappedNetwork = Object.keys(knownNetworks).reduce((match, chainId) => !match && knownNetworks[chainId].openseaSlug && knownNetworks[chainId].openseaSlug === network ? chainId : match, undefined);
                if (!mappedNetwork) {
                    warning.value = 'NFT Sender doesn\'t recognize network from the OpenSea URL';
                    contractAddress.value = undefined;
                }
                else if (BigInt(mappedNetwork) !== provider.value?.chainId) {
                    warning.value = provider.value ? `The NFT on the provided URL is on ${knownNetworks[mappedNetwork].displayName}, please change your wallet's network to ${knownNetworks[mappedNetwork].displayName}` : 'Please connect your wallet to fetch NFT details';
                    contractAddress.value = undefined;
                    contractAddressInput.value = getAddress(address);
                    contractAddress.value = getAddress(address);
                    idInput.value = id;
                }
                else {
                    warning.value = undefined;
                    contractAddressInput.value = getAddress(address);
                    contractAddress.value = getAddress(address);
                    idInput.value = id;
                }
            }
        });
    }
    useSignalEffect(() => {
        if (provider.value) {
            validateAddressInput();
            attemptToFetchNft(contractAddress.value, itemId.value);
        }
    });
    useSignalEffect(() => {
        if (contractAddressInput.value)
            validateAddressInput();
        else
            contractAddress.value = undefined;
        if (idInput.value) {
            const value = idInput.value.trim();
            itemId.value = /^\d+$/.test(value) ? BigInt(value) : undefined;
        }
        else {
            itemId.value = undefined;
        }
        if (transferAmountInput.value) {
            const value = transferAmountInput.value.trim();
            let amount = /^\d+$/.test(value) ? BigInt(value) : undefined;
            batch(() => {
                if (amount && selectedNft.value && selectedNft.value.type === 'ERC1155' && amount > selectedNft.value.balance)
                    warning.value = 'Transfer amount is greater than your wallet\'s balance';
                else
                    warning.value = undefined;
                transferAmount.value = amount;
            });
        }
        else {
            transferAmount.value = undefined;
        }
    });
    const recipientAddress = useComputed(() => {
        if (!recipientInput.value)
            return undefined;
        const value = recipientInput.value.toLowerCase().trim();
        return /^0x[a-f0-9]*$/.test(value) && value.length === 42 ? getAddress(value) : undefined;
    });
    const contractAddress = useSignal(undefined);
    const itemId = useSignal(undefined);
    const transferAmount = useSignal(undefined);
    const showWarn = useComputed(() => {
        const id = idInput.value !== '' && itemId.value === undefined;
        const amount = transferAmountInput.value !== '' && transferAmount.value === undefined;
        const recipient = recipientInput.value !== '' && recipientAddress.value === undefined;
        const contract = contractAddressInput.value !== '' && contractAddress.value === undefined;
        return { id, amount, recipient, contract };
    });
    async function attemptToFetchNft(address, id) {
        if (address === undefined || id === undefined) {
            return batch(() => {
                selectedNft.value = undefined;
                transferAmount.value = undefined;
                fetchingStates.value = 'empty';
            });
        }
        selectedNft.value = undefined;
        if (!provider.value?.provider) {
            return warning.value = 'noprovider';
        }
        fetchingStates.value = 'fetching';
        try {
            const identifiedAssets = await itentifyAddress(address, id, provider.value?.provider, provider.value?.walletAddress);
            if (identifiedAssets[0].address === contractAddress.value && identifiedAssets[0].inputId === itemId.value) {
                const supportedTypes = identifiedAssets.filter((token) => ['ERC721', 'ERC1155'].includes(token.type));
                if (supportedTypes.length === 0) {
                    if (identifiedAssets[0].type === 'ERC20')
                        warning.value = 'Token address provided is an ERC20 contract';
                    else if (identifiedAssets[0].type === 'EOA')
                        warning.value = 'Token address provided is an EOA';
                    else
                        warning.value = 'NFT not detected at provided contract address';
                }
                else {
                    selectedNft.value = supportedTypes[0];
                    if (provider.value && selectedNft.value.type === 'ERC721' && BigInt(selectedNft.value.owner) !== provider.value.walletAddress)
                        warning.value = 'You do not own this NFT';
                    if (supportedTypes.length > 1)
                        selectedMultiAssets.value = { displayIndex: selectedMultiAssets.peek().displayIndex >= supportedTypes.length ? 0 : selectedMultiAssets.peek().displayIndex, assets: supportedTypes };
                    else
                        selectedMultiAssets.value = { displayIndex: selectedMultiAssets.value.displayIndex, assets: [] };
                }
            }
        }
        catch (e) {
            console.log(e);
            if (typeof e === 'object' && e !== null && 'message' in e) {
                if (e.message === 'No ERC721 found at address')
                    return warning.value = 'Invalid token ID for the provided ERC721';
                if (e.message === 'Token ID does not exist')
                    return warning.value = 'badid';
            }
            return console.error(e);
        }
    }
    const { value: transactionReceipt, waitFor: waitForTransaction } = useAsyncState();
    async function sendTransfer() {
        if (!selectedNft.value || !recipientAddress.value || !provider.value)
            return;
        if (selectedNft.value.type === 'ERC721') {
            const txRequestPromise = transferERC721(selectedNft.value, recipientAddress.value, provider.value.provider);
            return waitForTransaction(() => txRequestPromise);
        }
        if (selectedNft.value.type === 'ERC1155' && transferAmount.value) {
            const txRequestPromise = transferERC1155(selectedNft.value, serialize(EthereumAddress, provider.value.walletAddress), recipientAddress.value, transferAmount.value, provider.value.provider);
            return waitForTransaction(() => txRequestPromise);
        }
    }
    return (_jsxs("div", { className: 'flex flex-col gap-4 w-full max-w-screen-xl', children: [_jsx("h2", { className: 'text-3xl font-semibold', children: "Transfer NFTs" }), _jsxs("div", { className: 'flex gap-4 flex-col sm:flex-row', children: [_jsx(TextInput, { warn: showWarn.value.contract, value: contractAddressInput, size: 'w-full', label: 'Contract Address', placeholder: '0x133...789 or OpenSea Item URL https://opensea.io/assets/...' }), _jsx(NumberInput, { warn: showWarn.value.id, label: 'Token ID', placeholder: '1', value: idInput })] }), selectedMultiAssets.value.assets.length > 0 ?
                _jsxs("div", { className: 'flex items-center gap-2', children: [_jsxs("div", { children: [_jsx("h3", { className: 'text-md font-semibold', children: "Multiple NFT Types Detected" }), _jsx("p", { className: 'text-sm', children: "Select Target NFT Type" })] }), selectedMultiAssets.value.assets.map((asset, index) => _jsx(Button, { variant: index === selectedMultiAssets.value.displayIndex ? 'primary' : 'secondary', onClick: () => batch(() => {
                                selectedMultiAssets.value = { ...selectedMultiAssets.peek(), displayIndex: index };
                                selectedNft.value = asset;
                                warning.value = provider.value && selectedNft.value.type === 'ERC721' && BigInt(selectedNft.value.owner) !== provider.value.walletAddress ? 'You do not own this NFT' : undefined;
                            }), children: asset.type }))] }) : null, selectedNft.value?.type === 'ERC1155' ?
                _jsx("div", { className: 'flex gap-4 flex-col sm:flex-row', children: _jsx(TokenAmountInput, { balance: selectedNft.value.balance, value: transferAmountInput, warn: showWarn.value.amount, label: 'Transfer Amount', size: 'w-full', placeholder: '1' }) })
                : null, fetchingStates.value !== 'empty' ? (_jsx("div", { className: 'flex flex-row flex-wrap border border-white/50 p-4 h-max gap-4', children: fetchingStates.value === 'fetching' ? _jsx(ItemDetails, { item: selectedNft }) : null })) : null, _jsx(BlockieTextInput, { value: recipientInput, label: 'Recipient Address', warn: showWarn.value.recipient, placeholder: '0x133...789' }), warning.value ? _jsx(SingleNotice, { variant: 'warn', description: warning.value, title: 'Warning' }) : null, provider.value
                ? _jsx(Button, { variant: 'full', disabled: sendText.value !== 'Send', onClick: sendTransfer, children: sendText.value })
                : _jsx(Button, { variant: 'full', onClick: () => connectBrowserProvider(provider, blockInfo), children: "Connect Wallet" }), transactionReceipt.value.state === 'rejected' && humanReadableEthersError(transactionReceipt.value.error).warning ? _jsx(SingleNotice, { variant: 'error', description: humanReadableEthersError(transactionReceipt.value.error).message, title: 'Error Sending Transfer' }) : null, transactionReceipt.value.state === 'resolved' ? _jsx(SingleNotice, { variant: 'success', description: `Transaction Hash: ${transactionReceipt.value.value.hash}`, title: 'Tranaction Submitted' }) : null] }));
};
//# sourceMappingURL=Transfer.js.map