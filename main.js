
(async () => {
    
    const { findAssets } = require('./scraper/scrapeAssets.js')
    const { findScripts } = require('./scraper/scrapeScripts.js')
    const { getBuildInfo } = require('./scraper/scrapeBuildInfo.js')
    const fs = require("fs").promises;

    var result = {}
    var lottieAssets = {}


    var dcHtml = await fetch('https://canary.discord.com/app')
    dcHtml = await dcHtml.text()

    const scripts = dcHtml.match(/<script src="\/assets\/[a-z0-9.]+\.js"[^>]+><\/script>/g)?.map((s) => s.match(/src="[^"]+"/g)?.[0].slice(13, -1))
    for (script of scripts){
        let content = await fetch(`https://canary.discord.com/assets/${script}`)
        content = await content.text()
        console.log(script)
        if (content.match(/(?<!\w)(\d*):(?<!\w)"[\d\w.]*.js",/g)) {
            console.log(script)
            console.log('FOUND CHUNK LOADER!!!!')
            console.log('FOUND CHUNK LOADER!!!!')
            console.log('FOUND CHUNK LOADER!!!!')
            let scripts_ = await findScripts(content)
            for (script_ of scripts_){
                let content_ = await fetch(`https://canary.discord.com/assets/${script_}`)
                content_ = await content_.text()
                let tempAssets = await findAssets(content_)

                for (asset of Object.keys(tempAssets)){
                    if (typeof tempAssets[asset] === "object"){
                        lottieAssets[asset] = tempAssets[asset]
                        await fs.writeFile(`./lottieAssets/${asset}.json`,JSON.stringify(tempAssets[asset],null,4))
                    }
                    if (typeof tempAssets[asset] === "string"){
                        result[asset] = tempAssets[asset]
                    }
                }
                if (Object.keys(tempAssets).length > 0){
                    console.log(`${script_} ${Object.keys(tempAssets).length}`)
                }            
            }
        }

        let BuildInfo = await getBuildInfo(content)
        console.log(BuildInfo)
        if (Object.keys(BuildInfo).length > 0){
            await fs.writeFile(`./buildInfo.json`,JSON.stringify(BuildInfo,null,4))
        }
        let tempAssets = await findAssets(content)
        
        for (asset of Object.keys(tempAssets)){
            if (typeof tempAssets[asset] === "object"){
                lottieAssets[asset] = tempAssets[asset]
                await fs.writeFile(`./lottieAssets/${asset}.json`,JSON.stringify(tempAssets[asset],null,4))
            }
            if (typeof tempAssets[asset] === "string"){
                result[asset] = tempAssets[asset]
            }
        }
        if (Object.keys(tempAssets).length > 0){
            console.log(`${script} ${Object.keys(tempAssets).length}`)
        }

    }
    console.log(`found normal: ${Object.keys(result).length}`)
    console.log(`found lottie: ${Object.keys(lottieAssets).length}`)

    await fs.writeFile('normal.json',JSON.stringify(result,null,4))


})();