import os 
import requests
from github import Github


def compareClasses(before,after):
    diff = "# Classes:\n```diff\n"
    stuff = {
        "ADDED":"",
        "REMOVED":"",
        "UPDATED":""
    }
    for key,value in after.items():
        if key not in before.keys():
            stuff['ADDED'] += f'+ {key}: "{value}"\n'
        else:
            if value != before[key]:
                stuff['UPDATED'] += f'- {key}:"{before[key]}"\n+ {key}: "{value}"\n'
    for key,value in before.items():
        if key not in after.keys():
            stuff['REMOVED'] += f'- {key}: "{value}"\n'
    
    for k,v in stuff.items():
        if v != "":
            diff += f"# {k.lower().capitalize()}:\n{v}\n\n"

    return diff + "```"


def compare(username, repository, token):
    url = f'https://api.github.com/repos/{username}/{repository}/commits'
    headers = {
        'Authorization': f'token {token}',
        'Accept': 'application/vnd.github.v3+json'
    }

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        commits = response.json()
        if commits[0]['commit']['message'] == "✅ classes updated!":
            parent = requests.get("https://raw.githubusercontent.com/happyendermangit/discord-assets_v2/"+commits[0]['parents'][0]['sha']+"/classes.json").json()
            commit = requests.get("https://raw.githubusercontent.com/happyendermangit/discord-assets_v2/"+commits[0]['sha']+"/classes.json").json()
            if parent != commit:
                diff = compareClasses(parent,commit)
                g = Github(token)
                repo = g.get_repo("happyendermangit/discord-assets_v2")
                commit = repo.get_commit(commits[0]['sha'])
                commit.create_comment(diff)
            else:
                print('no diff')

    else:
        print(f"Error: {response.status_code}")
        return None


username = 'happyendermangit'
repository = 'discord-assets_v2'
token = os.getenv('ACCESS_TOKEN')

compare(username, repository, token)