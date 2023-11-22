import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { Navbar } from './Navbar.js';
import { createGlobalState } from '../stores.js';
import { Transfer } from './Transfer.js';
import { Footer } from './Footer.js';
export function App() {
    const state = createGlobalState();
    return (_jsxs("main", { class: 'bg-black text-primary w-screen max-w-screen overflow-hidden min-h-screen sm:p-4 p-6 gap-4 font-serif flex flex-col items-center', children: [_jsx(Navbar, { ...state }), _jsx(Transfer, { ...state }), _jsx(Footer, {})] }));
}
//# sourceMappingURL=App.js.map