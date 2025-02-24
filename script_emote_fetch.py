import os
import re
import requests
from bs4 import BeautifulSoup

# URL to scrape
webpage_url = "https://strinova.org/wiki/Category:Emotes"
image_base_url = "https://static.wikitide.net/strinovawiki/"
headers = {"User-Agent": "Mozilla/5.0 (X11; CrOS x86_64 12871.102.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.141 Safari/537.36"}

# Folder to save images
save_folder = "EmotesWiki"
os.makedirs(save_folder, exist_ok=True)

# Fetch the webpage content
response = requests.get(webpage_url, timeout=5, headers=headers)
if response.status_code != 200:
    print("Failed to fetch the webpage." + response.content.decode())
    
    exit()

# Parse the HTML content
soup = BeautifulSoup(response.text, "html.parser")

# Regex pattern to find emote ID strings
pattern = r"[a-z0-9]/[a-z0-9][a-z0-9]/Emote_\d{8}"

# Find all occurrences of the emote ID
matches = re.findall(pattern, response.text)
unique_ids = set(matches)  # Use a set to remove duplicates

print(f"Found {len(unique_ids)} emotes.")

# Download and save each image
for emote_id in unique_ids:
    emote_id = str(emote_id)
    print(emote_id)
    if os.path.isfile(str.replace(emote_id, " ", "_") + ".png"): continue
    
    parts = emote_id.split("/")
    
    var1 = parts[0]
    var2 = parts[1]
    emote_id = parts[2]
    
    image_url = f"{image_base_url}{var1}/{var2}/{emote_id}.png"
    
    image_path = os.path.join(save_folder, f"{emote_id}.png")

    print(f"Downloading {image_url}...")

    img_response = requests.get(image_url, timeout=2, headers=headers)
    if img_response.status_code == 200:
        with open(image_path, "wb") as file:
            file.write(img_response.content)
        print(f"Saved: {image_path}")
    else:
        print(f"Failed to download: {image_url}" + img_response.content.decode())

print("Download complete!")
