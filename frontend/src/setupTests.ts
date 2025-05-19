import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// import "whatwg-fetch";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

// if (typeof global.BroadcastChannel === "undefined") {
//   global.BroadcastChannel = class BroadcastChannel {
//     constructor(public name: string) {}
//     postMessage(message: any) {}
//     close() {}
//     addEventListener() {}
//     removeEventListener() {}
//     dispatchEvent() {
//       return true;
//     }
//   } as any;
// }

// // Additional polyfills for MSW
// if (typeof global.TextEncoder === "undefined") {
//   const { TextEncoder, TextDecoder } = require("util");
//   global.TextEncoder = TextEncoder;
//   global.TextDecoder = TextDecoder;
// }

// // Mock crypto.randomUUID if not available
// if (typeof globalThis.crypto === "undefined") {
//   globalThis.crypto = {
//     randomUUID: () => {
//       return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
//         /[xy]/g,
//         function (c) {
//           const r = (Math.random() * 16) | 0;
//           const v = c === "x" ? r : (r & 0x3) | 0x8;
//           return v.toString(16);
//         }
//       );
//     },
//   } as any;
// }
