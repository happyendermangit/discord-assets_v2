const path = require("path");
const acorn = require("acorn");
const walk = require("acorn-walk");


async function findScripts(code) {
    const ast = acorn.parse(code, { ecmaVersion: "2022", locations: true });
    let scripts = []

    walk.simple(ast, {
        Literal(node){
            try{
                if (node?.value?.endsWith('.js')){
                    scripts.push(node?.value)
                }
            }
            catch{

            }
            
        }
    }
    );
    return scripts

}



module.exports = { findScripts }