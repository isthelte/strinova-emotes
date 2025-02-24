import os
import sys
import json
import re

# Path to the emotes folder
emotes_folder_names = ['EmotesWiki', 'ChatEmote', 'PopTeamEpic']
# Path to the output file
output_file_path = 'emote-data.js'

def parse_emote_filename(folder, filename):
    """Parse emote filename based on folder type."""
    if folder in ['EmotesWiki', 'ChatEmote']:
        # Expected format: CharacterName_ID.png
        match = re.match(r'([^_]+)_(\d+)\.png', filename)
        if match:
            character_name, emote_id = match.groups()
            return {
                'character': character_name,
                'id': emote_id,
                'path': f'{folder}/{filename}'
            }
    elif folder == 'PopTeamEpic':
        return {
            'path': f'{folder}/{filename}'
        }
    return None

def generate_emote_data():
    emote_data = {
        'EmotesWiki': {},
        'ChatEmote': {},
        'PopTeamEpic': []
    }
    
    for folder_name in emotes_folder_names:
        if not os.path.exists(folder_name):
            print(f"Warning: Folder '{folder_name}' not found")
            continue
            
        for filename in sorted(os.listdir(folder_name)):
            if not filename.lower().endswith('.png'):
                continue
                
            file_path = os.path.join(folder_name, filename)
            if not os.path.exists(file_path):
                print(f"Error: File not found at {file_path}")
                continue
                
            parsed_data = parse_emote_filename(folder_name, filename)
            if not parsed_data:
                print(f"Warning: Could not parse filename {filename}")
                continue
                
            if folder_name in ['EmotesWiki', 'ChatEmote']:
                character = parsed_data['character']
                if character not in emote_data[folder_name]:
                    emote_data[folder_name][character] = []
                emote_data[folder_name][character].append({
                    'path': parsed_data['path'],
                    'id': parsed_data['id']
                })
            else:  # PopTeamEpic
                emote_data[folder_name].append({
                    'path': parsed_data['path']
                })

    return emote_data

try:
    # Generate the data
    emote_data = generate_emote_data()
    
    # Convert to JavaScript
    js_content = f"const emoteData = {json.dumps(emote_data, indent=2)}"
    
    # Write to file
    with open(output_file_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print(f"Successfully generated emote data in {output_file_path}")
    
except Exception as e:
    print(f"Error generating emote data: {str(e)}")
    sys.exit(1)