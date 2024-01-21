
(async () => {


    
    const { findAssets } = require('./scrapeAssets.js')
    const { findScripts } = require('./scrapeScripts.js')
    const { getBuildInfo } = require('./scrapeBuildInfo.js')
    const fs = require("fs");
    const https = require('https');


    const wait = async (t) => new Promise((res, rej) => setTimeout(_=>res(),t));

    
    const config = {}

    config.build = "canary"
    config.discordUrl =  `https://${config.build === "stable" ? "" : `${config.build}.`}discord.com`
    config.assetEndpoint = "".concat(config.discordUrl,"/assets/")
    config.appEndpoint = "".concat(config.discordUrl,"/app")

    
    async function downloadAsset(asset) {
        try {
            const response = await fetch(`${config.discordUrl}${asset}`);

            if (!response.ok) {
                throw new Error(`Failed to download ${asset}. Status: ${response.status} ${response.statusText}`);
            }

            const buffer = await response.arrayBuffer();
            const fileContent = Buffer.from(buffer);

            fs.writeFileSync('..' + asset, fileContent);

            console.log(`[DOWNLOADER] Downloaded ${asset}`);
        } catch (error) {
            console.error(`[DOWNLOADER] Error downloading ${asset}:`, error);
        }
    }
    
    console.log('[INIT] Intiliazed config!')
    console.log(config)

    var result = []
    var lottieAssets = {}


    var dcHtml = await fetch(config.appEndpoint)
    dcHtml = await dcHtml.text()
    console.log(`[SCRAPER] Scraping assets for ${config.build}`)
    console.log('[INFO] Scraped discord html!')

    const scripts = dcHtml.match(/<script src="\/assets\/[a-z0-9.]+\.js"[^>]+><\/script>/g)?.map((s) => s.match(/src="[^"]+"/g)?.[0].slice(13, -1))
    const styleSheets = dcHtml.match(/<link href="\/assets\/[a-z0-9.]+\.css"[^>]+>/g)
    ?.map((s) => s.match(/href="[^"]+"/g)?.[0].slice(14, -1))
    for (style of styleSheets){
        var content = await fetch("".concat(config.assetEndpoint,style))
        
        content = await content.text()
        
        var assetLinks = content.match(/\/assets\/[^)\s]+\.[^)\s^"^']+/g)
        console.log(`[INFO] Found ${assetLinks.length} on ${style}`)
        for (asset of assetLinks){
            await downloadAsset(asset)
            await wait(1)
        }

    }


    for (script of scripts){
        let content = await fetch(`${config.assetEndpoint}${script}`)
        content = await content.text()
        console.log(script)
        if (content.match(/(?<!\w)(\d*):(?<!\w)"[\d\w.]*.js",/g)) {
            console.log(script)
            console.log('FOUND CHUNK LOADER!!!!')
            console.log('FOUND CHUNK LOADER!!!!')
            console.log('FOUND CHUNK LOADER!!!!')
            let scripts_ = await findScripts(content)
            for (script_ of scripts_){
                let content_ = await fetch(`${config.assetEndpoint}${script_}`)
                content_ = await content_.text()
                let tempAssets = await findAssets(content_)

                for (asset of Object.keys(tempAssets)){
                    if (typeof tempAssets[asset] === "object"){
                        lottieAssets[asset] = tempAssets[asset]
                        await fs.writeFile(`../lottieAssets/${tempAssets[asset].nm}.json`,JSON.stringify(tempAssets[asset],null,4))
                    }
                    if (typeof tempAssets[asset] === "string"){
                        if (!tempAssets[asset].startsWith('data:image/')){
                            await downloadAsset(tempAssets[asset])
                            await wait(1) 
                        }
                        result.push(tempAssets[asset])
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
            await fs.writeFile(`../buildInfo.json`,JSON.stringify(BuildInfo,null,4))
        }
        let tempAssets = await findAssets(content)
        
        for (asset of Object.keys(tempAssets)){
            if (typeof tempAssets[asset] === "object"){
                lottieAssets[asset] = tempAssets[asset]
                await fs.writeFile(`../lottieAssets/${tempAssets[asset].nm}.json`,JSON.stringify(tempAssets[asset],null,4))
            }
            if (typeof tempAssets[asset] === "string"){
                if (!tempAssets[asset].startsWith('data:image/')){
                    await downloadAsset(tempAssets[asset])
                    await wait(1) 
                }
                result.push(tempAssets[asset])
            }
        }
        if (Object.keys(tempAssets).length > 0){
            console.log(`${script} ${Object.keys(tempAssets).length}`)
        }

    }
    console.log(`found normal: ${Object.keys(result).length}`)
    console.log(`found lottie: ${Object.keys(lottieAssets).length}`)

    await fs.writeFile('../assets.json',JSON.stringify(result,null,4))


})();