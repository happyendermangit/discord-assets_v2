import requests,zipfile

# Scrape last message on apk's channel using a bot token
lastMessage = requests.get('https://canary.discord.com/api/v9/channels/1198970255075188777/messages',headers={
    "Authorization":"Bot MTE5ODk2NjU0MDU0NTA1Mjc0Mw.GI7oRc.FPL7mb6I1x3qCIf7GcRVUgTB0am72jgfvj74SA"
}).json()[0]

# check if it's posted by bot
if lastMessage.get('author').get('bot'):
    
    # Scrape version and download link:
    downloadLink = m.embeds[0].description.replace(' ','').split('[base.apk](')[1].split(')')[0]
    version = downloadLink.split('?v=')[1]

    # Download apk:
    with requests.get(downloadLink, stream=True) as r:
        r.raise_for_status()
        with open(f"./apk/{version}.apk", 'wb') as f:
            print('[DOWNLOADING]')
            for chunk in r.iter_content(chunk_size=8192): 
                f.write(chunk)
        print("[DOWNLOADED]")
        print('[EXTRACTING]')
        # Extract the apk
        with zipfile.ZipFile(f"./apk/{version}.apk", 'r') as zip_ref:
            zip_ref.extractall(f"./")
        print('[EXTRACTED]')
       