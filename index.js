import "./fix.js";
import fs from "fs"
import prettyBytes from "pretty-bytes";
import pretty from "pretty-time"

const { createDocumentRegistry, createLanguageService, JsxEmit, ModuleKind, ModuleResolutionKind, ScriptSnapshot, ScriptTarget } = await import("typescript");

const options = {
    esModuleInterop: true,
    module: ModuleKind.ES2022,
    target: ScriptTarget.ES2022,
    moduleResolution: ModuleResolutionKind.Node10,
    lib: [
        "lib.dom.d.ts",
        "lib.dom.iterable.d.ts",
        "lib.es2023.d.ts"
    ],
    jsx: JsxEmit.React
};


const file = "sample.tsx"

const sourceFiles = new Map([
    [file, 0]
])

const serviceHost = {
    getCompilationSettings: () => options,
    getScriptFileNames: () => Array.from(sourceFiles.keys()),
    getScriptVersion: (fileName) => (sourceFiles.get(fileName) ?? 0).toString(),
    getScriptSnapshot: (fileName) => ScriptSnapshot.fromString(fs.readFileSync(fileName, { encoding: "utf-8" })),
    getCurrentDirectory: () => process.cwd(),
    getDefaultLibFileName: () => "node_modules/typescript/lib/lib.d.ts",
    readFile: (path) => fs.readFileSync(path, { encoding: "utf-8" }),
    fileExists: (path) => fs.existsSync(path)
}
const service = createLanguageService(
    serviceHost,
    createDocumentRegistry()
);

const interval1 = setInterval(() => {
    if (typeof Bun !== "undefined") {
        Bun.gc(true);
    }
    
    service.getSemanticDiagnostics(file)
    sourceFiles.set(file, (sourceFiles.get(file) ?? 0) + 1);
}, 100)

const start = process.hrtime();
let min = Number.MAX_VALUE;
let max = 0;

const interval2 = setInterval(() => {
    const mem = process.memoryUsage().heapTotal;
    if(mem < min) {
        min = mem
    }
    if(mem > max) {
        max = mem
    }

    const time = process.hrtime(start)

    if(time[0] >= 60) {
        clearInterval(interval1);
        clearInterval(interval2);
        console.log(`Memory after 1m: ${prettyBytes(mem)} [max: ${prettyBytes(max)}, min: ${prettyBytes(min)}]`);
    } else {
        console.log(pretty(time), prettyBytes(process.memoryUsage().heapTotal))
    }
}, 1000)

