import "./fix";
import fs from "fs"
import { heapStats } from "bun:jsc"
import prettyBytes from "pretty-bytes";
import type { CompilerOptions, LanguageServiceHost } from "typescript";


const { createDocumentRegistry, createLanguageService, JsxEmit, ModuleKind, ModuleResolutionKind, ScriptSnapshot, ScriptTarget } = await import("typescript");

const options: CompilerOptions = {
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

const sourceFiles = new Map<string, number>([
    [file, 0]
])

const serviceHost: LanguageServiceHost = {
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

setInterval(() => {
    Bun.gc(true);
    service.getSemanticDiagnostics(file)
    sourceFiles.set(file, (sourceFiles.get(file) ?? 0) + 1);
}, 100)

setInterval(() => {
    console.log(prettyBytes(heapStats().heapSize))
}, 1000)

