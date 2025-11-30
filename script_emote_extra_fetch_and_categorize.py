import requests
from bs4 import BeautifulSoup
import re
import os
from urllib.parse import unquote

# headers used for requests
headers = {"User-Agent": "Mozilla/5.0 (X11; CrOS x86_64 12871.102.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.141 Safari/537.36"}

# Create output directory if it doesn't exist
output_dir = "EmotesWikiExtra"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)
    print(f"Created directory: {output_dir}")

### Get name list from Characters list: https://strinova.org/wiki/Characters ###
print("### Get name list from Characters list ###")
print("Fetching web page...")
response = requests.get("https://strinova.org/wiki/Characters", timeout=3, headers=headers)

soup = BeautifulSoup(response.text, "html.parser")

print("Process web page to get character names...")
tables = soup.find_all("table")
table_text = str(tables[0])

pattern = r"title=\"{1}[a-zA-z ]+\"{1}"
matches = set(re.findall(pattern, table_text))
name_list = list(map(lambda x: x.split("\"")[1], matches))

print(f"{len(name_list)} names fetched.")

### Download emotes for each character ###
print("\n### Downloading emotes for each character ###")
total_downloaded = 0

for name in name_list:
    print(f"\nProcessing {name} gallery")
    try:
        response = requests.get(f"https://strinova.org/wiki/{name}/gallery", timeout=3, headers=headers)
        soup = BeautifulSoup(response.text, "html.parser")

        # Find the Other_emotes section
        other_emotes_section = soup.find(id="Other_emotes")
        
        if other_emotes_section is None:
            print(f"Warning: 'Other_emotes' section not found for {name}")
            continue
        
        # Get the ul element that contains the emote gallery
        emotes_ul = other_emotes_section.parent.next_sibling.next_sibling
        
        # Find all image links in the gallery
        image_links = emotes_ul.find_all("img")
        
        if not image_links:
            print(f"No emote images found for {name}")
            continue
        
        print(f"Found {len(image_links)} emote images for {name}")
        
        for img in image_links:
            # Get the image source URL
            img_src = img.get("src")
            
            if not img_src:
                continue
            
            # Make sure we have the full URL
            if img_src.startswith("//"):
                img_src = "https:" + img_src
            elif img_src.startswith("/"):
                img_src = "https://strinova.org" + img_src
            
            # Extract filename from URL
            # The src might be like: //static.wikitide.net/strinovawiki/thumb/1/1d/Emotes_extra_Audrey_boom.png/180px-Emotes_extra_Audrey_boom.png
            # We want the original filename: Emotes_extra_Audrey_boom.png
            filename_match = re.search(r"(Emotes_extra_[^/]+\.png)", img_src)
            
            if not filename_match:
                print(f"Could not extract filename from {img_src}")
                continue
            
            original_filename = filename_match.group(1)
            # Decode URL-encoded characters (like %E5%BC%B9)
            original_filename = unquote(original_filename)
            
            # Create new filename with character name prefix
            new_filename = f"{name}_{original_filename}"
            filepath = os.path.join(output_dir, new_filename)
            
            # Skip if file already exists
            if os.path.exists(filepath):
                print(f"Skipping {new_filename}: Already exists")
                continue
            
            # Get the original (non-thumbnail) image URL
            # The pattern is: /strinovawiki/thumb/X/XX/Filename.png/180px-Filename.png
            # We want: /strinovawiki/X/XX/Filename.png
            if '/thumb/' in img_src:
                # Remove '/thumb/' and everything after the actual filename
                original_img_src = re.sub(r'/thumb/([^/]+/[^/]+/[^/]+\.png)/\d+px-.*', r'/\1', img_src)
            else:
                original_img_src = img_src
            
            try:
                print(f"Downloading {new_filename}...")
                print(f"  URL: {original_img_src}")
                img_response = requests.get(original_img_src, timeout=10, headers=headers)
                img_response.raise_for_status()
                
                with open(filepath, 'wb') as f:
                    f.write(img_response.content)
                
                print(f"✓ Downloaded: {new_filename}")
                total_downloaded += 1
                
            except Exception as e:
                print(f"✗ Failed to download {new_filename}: {e}")
        
    except Exception as e:
        print(f"Error processing {name}: {e}")
        continue

print(f"\n### Download complete! ###")
print(f"Total images downloaded: {total_downloaded}")