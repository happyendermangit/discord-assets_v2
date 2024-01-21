
(async () => {


    const githubHeaders = {
        "Authorization":`Bearer ${process.env.ACCESS_TOKEN}`,
        "Accept":"application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
    }

    const OWNER = "happyendermangit"
    const REPO = "discord-assets_v2"

    let diff = {
        "added":"",
        "updated":"",
        "removed":""
    }

    const capitalize = (s) => {
        return s[0].toUpperCase() + s.slice(1);
    }

    const createComment = (sha,body) => {
        fetch(`https://api.github.com/repos/${OWNER}/${REPO}/commits/${sha}/comments`,{
            method:"POST",
            headers:githubHeaders,
            body:JSON.stringify({
                body: body
            })
        }).then(e=>e.json()).then(e=>console.log(e))
    }

   

    const commitsRequest = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/commits`,{
        headers:githubHeaders
    })

    var commits = await commitsRequest.json()

    const latestCommitRequest = await fetch(commits[0].url,{
        headers:{
            "Authorization":"Bearer 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",
            "Accept":"application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28"
        }
    })

    var latestCommit = await latestCommitRequest.json()

    var files = latestCommit.files 

    for (file of files){
    
        if (file.status != "renamed"){
            var category = file.status === "modified" ? "updated" : file.status 
            diff[category] += `${file.status === "removed" ? "-" : "+"} ${file.filename}\n`    
        }
    
    }

    let result = "## Assets:\n```diff\n"

    for (type in diff){
       
        if (diff[type] != ""){
            result += `# ${capitalize(type)}\n${diff[type]}\n`
        }

    }

    result += "```"
    if (latestCommit.commit.message === "✅ assets updated!") {
        createComment(latestCommit.sha,result)
    }
    

})();