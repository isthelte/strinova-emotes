import requests
from bs4 import BeautifulSoup
import re
import os

# headers used for requests
headers = {"User-Agent": "Mozilla/5.0 (X11; CrOS x86_64 12871.102.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.141 Safari/537.36"}

### Get name list from Characters list: https://strinova.org/wiki/Characters ###
print("### Get name list from Characters list ###")
print("Fetching web page...")
response = requests.get("https://strinova.org/wiki/Characters", timeout=3, headers=headers)

soup = BeautifulSoup(response.text, "html.parser")

print("Process web page to get character names...")
tables = soup.findAll("table")
table_text = str(tables[0])

pattern = r"title=\"{1}[a-zA-z ]+\"{1}"
matches = set(re.findall(pattern, table_text))
name_list = list(map(lambda x: x.split("\"")[1], matches))

print(f"{len(name_list)} names fetched.")

### Get emotes id for each char name ###
print("\n### Get emotes id for each character name ###")
name_id_dict = dict()

for name in name_list:
    print(f"Processing {name} gallery")
    response = requests.get(f"https://strinova.org/wiki/{name}/gallery", timeout=3, headers=headers)
    
    soup = BeautifulSoup(response.text, "html.parser")

    emotes_ul = str(soup.find(id="Emotes").parent.next_sibling.next_sibling)
    
    pattern = r"Emote_\d{8}.png"

    matches = set(re.findall(pattern, emotes_ul))
    list_emote_ids = list(map(lambda x: re.search(r"\d{8}", x).group(), matches))
    
    print(f"Found {len(list_emote_ids)} emote ids. Append to dictionary")
    name_id_dict[name] = list_emote_ids
    
print("Finished fetching characters name and emotes id.")

### Categorize emotes based on ids ###
print("\n### Categorizing emotes based on fetched info ###")
for file in os.listdir("EmotesWiki"):
    filename = os.fsdecode(file)
    
    emote_id = re.search(r"\d{8}", filename).group()
    
    for key, val in name_id_dict.items():    
        if emote_id in val:
            print("Found matched pair, renaming...")
            old_file = os.path.join("EmotesWiki", file)
            new_file = os.path.join("EmotesWiki", f"{key}_{emote_id}.png")
            os.rename(old_file, new_file)
            print(f"Renamed {old_file} into {new_file}")
            
print("Finished categorizing.")