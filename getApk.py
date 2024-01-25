import requests,zipfile,os

# Scrape last message on apk's channel using a bot token
lastMessage = requests.get('https://canary.discord.com/api/v9/channels/1198970255075188777/messages',headers={
    "Authorization":f"Bot {os.getenv('DISCORD_TOKEN')}"
}).json()[0]

if lastMessage.get('author').get('bot'):
    
    # Scrape version and download link:
    downloadLink = lastMessage.get('embeds')[0].get('description').replace(' ','').split('[base.apk](')[1].split(')')[0]
    version = downloadLink.split('?v=')[1]
    print(lastMessage.get('embeds')[0].get('description').replace(' ',''))
    # Download base.apk:
    with requests.get("https://bitbucket.org/iBotPeaches/apktool/downloads/apktool_2.9.3.jar", stream=True) as r:
        r.raise_for_status()
        with open(f"./apk/apktool.jar", 'wb') as f:
            print('[DOWNLOADING]')
            for chunk in r.iter_content(chunk_size=8192): 
                f.write(chunk)
    with requests.get(downloadLink, stream=True) as r:
        r.raise_for_status()
        with open(f"./apk/{version}.apk", 'wb') as f:
            print('[DOWNLOADING]')
            for chunk in r.iter_content(chunk_size=8192): 
                f.write(chunk)
    print("[DOWNLOADED]")
    print('[EXTRACTING]')
    
    # Extract the apk
    print(version)
    os.system(f'java -jar d ./apk/apktool.jar ./apk/{version}.apk')
                
        
            
    print('[EXTRACTED]')
    # Download &split=config.xxhdpi:   
    with requests.get(downloadLink+"&split=config.xxhdpi", stream=True) as r:
        r.raise_for_status()
        with open(f"./apk/{version}.config.xxhdpi.apk", 'wb') as f:
            print('[DOWNLOADING]')
            for chunk in r.iter_content(chunk_size=8192): 
                f.write(chunk)
        print("[DOWNLOADED]")
        print('[EXTRACTING]')
    # Extract the apk
    os.system(f'java -jar d ./apk/apktool.jar ./apk/{version}.config.xxhdpi.apk')


            
def cleanFolder(path):
    print(path)
    if path == "./apk" or path == "./.git" or path == "./.github" or path == "./scraper":
        return

    for file in os.listdir(path):
        file_path = os.path.join(path, file)

        if os.path.isfile(file_path):
            os.remove(file_path)
        elif os.path.isdir(file_path):
            cleanFolder(file_path)

    os.rmdir(path)

for file in os.listdir('./'):
    if os.path.isfile(file) and file != "AndroidManifest.xml" and file != "getApk.py" and file != "readme.md":
        print(f'[DELETED] {file}')
        os.remove(file)
    elif os.path.isdir(file) and file != "assets" and file != "res" and file != ".git" and file != ".github":
        print(file)
        cleanFolder("./"+file)
cleanFolder('./assets/dexopt')
