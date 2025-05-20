import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";

import { MessagePort } from "node:worker_threads";
fetchMock.enableMocks();

import { TextEncoder, TextDecoder } from "util";
import { ReadableStream, TransformStream } from "node:stream/web";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
global.MessagePort = MessagePort as any;
// import "whatwg-fetch";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

if (typeof global.BroadcastChannel === "undefined") {
  global.BroadcastChannel = class BroadcastChannel {
    constructor(public name: string) {}
    postMessage(message: string) {}
    close() {}
    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() {
      return true;
    }
  } as any;
}

Object.defineProperties(globalThis, {
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder },
  ReadableStream: { value: ReadableStream },
  TransformStream: { value: TransformStream },
});

import { Blob, File } from "node:buffer";
import { fetch, Headers, FormData, Request, Response } from "undici";
import { configure } from "@testing-library/react";

Object.defineProperties(globalThis, {
  fetch: { value: fetch, writable: true },
  Blob: { value: Blob },
  File: { value: File },
  Headers: { value: Headers },
  FormData: { value: FormData },
  Request: { value: Request },
  Response: { value: Response },
});
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
