
const fs = require("fs").promises;
const path = require("path");
const acorn = require("acorn");
const walk = require("acorn-walk");
const escodegen = require('escodegen');



async function getBuildInfo(code) {
    const ast = acorn.parse( code, { ecmaVersion: "2022" });
    let BuildInfo = {}

    walk.simple(ast, {
        ObjectExpression(node) {
            const keys = node?.properties?.map(e => e?.key?.name);
            
            if (    
                keys?.includes("buildNumber") &&
                keys?.includes("versionHash")  
            ) {
                const strings = node?.properties
                for (string of strings){
                    let key = string.key.value ?? string.key.name
                    if (key === "buildNumber" || key === "versionHash"){
                        BuildInfo[key] = string.value.value
                    }
                } 
        

            }
        },
    });
    return BuildInfo

}

module.exports = { getBuildInfo }