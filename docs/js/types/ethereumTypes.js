import * as t from 'funtypes';
export const AddressParser = {
    parse: (value) => {
        if (!/^0x([a-fA-F0-9]{40})$/.test(value))
            return {
                success: false,
                message: `${value} is not a hex string encoded address.`,
            };
        else
            return { success: true, value: BigInt(value) };
    },
    serialize: (value) => {
        if (typeof value !== 'bigint')
            return { success: false, message: `${typeof value} is not a bigint.` };
        return { success: true, value: `0x${value.toString(16).padStart(40, '0')}` };
    },
};
export const EthereumAddress = t.String.withParser(AddressParser);
//# sourceMappingURL=ethereumTypes.js.map