import json
version = json.load(open('./assets/manifest.json','r',encoding="utf-8"))

print(version.get('metadata').get('build'))
