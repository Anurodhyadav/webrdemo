import { WebR, Console } from "https://webr.r-wasm.org/latest/webr.mjs";

const webRObject = new WebR();
const fs = webRObject.FS;

export { WebR, fs, Console };
