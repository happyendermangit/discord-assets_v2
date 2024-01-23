
(async () => {


    const githubHeaders = {
        "Authorization":`Bearer ${process.env.ACCESS_TOKEN}`,
        "Accept":"application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
    }

    const OWNER = "happyendermangit"
    const REPO = "discord-assets_v2"

    let diff = {
        "Added Files":"",
        "Updated Files":"",
        "Removed Files":""
    }




   

    const commitsRequest = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/commits`,{
        headers:githubHeaders
    })
    

    var commits = await commitsRequest.json()

    const latestCommitRequest = await fetch(commits[0].url,{
        headers:{
            "Authorization":`Bearer ${process.env.ACCESS_TOKEN}`,
            "X-GitHub-Api-Version": "2022-11-28"
        }
    })

    var latestCommit = await latestCommitRequest.json()

    var files = latestCommit.files 
    console.log(files)

    for (file of files){
    
        if (file.status != "renamed"){
            var category; if (file.status === "modified") category = "Updated Files"; if (file.status === "added") category = "Added Files"; if (file.status === "removed") category = "Removed Files"
            diff[category] += `${file.status === "removed" ? "-" : "+"} ${file.filename}\n`    
        }
    
    }

    let metadata = await fetch('https://raw.githubusercontent.com/happyendermangit/discord-assets_v2/main/assets/manifest.json')
    metadata = await metadata.json()
    metadata = metadata.metadata
    let result = "## Assets (buildNumber):\n```diff\n".replace('buildNumber',metadata.build)

    console.log(result)
    for (type in diff){
       
        if (diff[type] != ""){
            result += `# ${capitalize(type)}\n${diff[type]}\n`
        }

    }

    result += "```"
    if (latestCommit.commit.message === "✅ assets updated!") {
        await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/commits/${latestCommit.sha}/comments`,{
            method:"POST",
            headers:githubHeaders,
            body:JSON.stringify({
                body: result
            })
        })
    }
    

})();
