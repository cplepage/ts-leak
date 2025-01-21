import fs from "fs";

const codeToLookup = "program = createProgram(options);";
const codeToAdd = "options.oldProgram = undefined;";

const tsFilePath = "node_modules/typescript/lib/typescript.js";

const regexp = new RegExp(
    `${codeToLookup.replace(/(\(|\))/g, (c) => (c === "(" ? "\\(" : "\\)"))}(${codeToAdd})*`
);

function addFix() {
    const tsFileContent = fs.readFileSync(tsFilePath, { encoding: "utf-8" });
    const textBlockToUpdate = tsFileContent.match(regexp);
    if (textBlockToUpdate) {
        if (!textBlockToUpdate[0].endsWith(codeToAdd)) {
            console.log("Adding fix")
            fs.writeFileSync(
                tsFilePath,
                tsFileContent.replace(regexp, codeToLookup + codeToAdd)
            );
        } else {
            console.log("Fix already in place")
        }
    } else {
        throw "Could not find typescript code block to patch.";
    }
}

function removeFix() {
    const tsFileContent = fs.readFileSync(tsFilePath, { encoding: "utf-8" });
    const textBlockToUpdate = tsFileContent.match(regexp);
    if (textBlockToUpdate) {
        if (textBlockToUpdate[0].endsWith(codeToAdd)) {
            console.log("Removing fix")
            fs.writeFileSync(
                tsFilePath,
                tsFileContent.replace(regexp, codeToLookup)
            );
        } else {
            console.log("No fix found")
        }
    } else {
        throw "Could not find typescript code block to patch.";
    }
}

if(process.argv.includes("--fix")) {
    addFix();
} else {
    removeFix();
}