const path = require("path");
const acorn = require("acorn");
const walk = require("acorn-walk");
const escodegen = require("escodegen");


async function findAssets(code) {
    const ast = acorn.parse(code, { ecmaVersion: "2022", locations: true });
    let assets = {}

    walk.full(ast, (node)=>{
        {
               
            /**  checks if it's the correct chunk of an asset 
             * an chunk for an asset contains two lines of code in the function
             * example:
             *  119699: function(t, s, c) {
                    "use strict";
                    t.exports = c.p + "72854bcca232faa189dd.svg"
             *  },
             
            **/

            if (
                node?.value?.type === "FunctionExpression" &&
                node?.value?.body?.type === "BlockStatement" &&
                node?.value?.body?.body?.length === 2
            ){
                let body1 = node?.value?.body?.body[1]

                try{
                    let splits = escodegen.generate(body1).split('=')
                    if (
                        splits.length === 2 && 
                        splits[1].split('+').length == 2 
                    ){
                        if (
                            splits[1].split('+')[1].replaceAll(' ','').startsWith(`'`) ||
                            splits[1].split('+')[1].replaceAll(' ','').startsWith(`"`) 
                        ){
                            assets[node?.key?.name ?? node?.key?.value] = splits[1].split('+')[1].replaceAll(' ','').replaceAll(`'`,'').replaceAll(`"`,'').replaceAll(`;`,'')
                        }
                    }
                    //assets[node?.key?.value ?? node?.key?.name] = eval(`let b={};!${escodegen.generate(node?.value)}(b,null,{}),b.exports.replaceAll('undefined','')`)
                }
                catch{
                }
                

                
                try{
                    if (body1?.expression?.right?.value?.startsWith('data:image/')){
                        assets[node?.key?.value ?? node?.key?.name] = body1?.expression?.right?.value
                    }
                }catch{

                }

                try{
                    let keys = body1?.expression?.right?.properties.map(e=> e?.key?.name)
                    if (
                        body1?.expression?.right?.type === "ObjectExpression" && 
                        keys.includes('nm') && 
                        keys.includes('v') && 
                        keys.includes('w') &&
                        keys.includes('h')  
                    ){
                        assets[node?.key?.value ?? node?.key?.name] = eval(`const d = ${escodegen.generate(body1?.expression?.right)};d`)
                    }    
                }
                catch{
                }
               
                
                
            }
            
        }
    }
    );
    return assets

}



module.exports = { findAssets }