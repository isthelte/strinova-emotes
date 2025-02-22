import os
import sys

# Path to the emotes folder
emotes_folder_names = ['EmotesWiki','ChatEmote','PopTeamEpic']
# Path to the log file
log_file_path = 'emote-relative-paths.txt'
with open(log_file_path, 'r+') as log_file:
    log_file.truncate(0)

for emotes_folder_name in emotes_folder_names:
    emotes_dir = emotes_folder_name

    image_files = []
    for file in os.listdir(emotes_folder_name):
        image_files.append(os.path.join(emotes_dir, file))
    
    # Check if we found any images
    if not image_files:
        print(f"No image files found in the '{emotes_folder_name}' folder")
        sys.exit()
    
    with open(log_file_path, 'a') as log_file:
        log_file.write(f"// {emotes_folder_name}\n")
    
    for i, image_path in enumerate(image_files):
        try:
            # Check if file exists
            if not os.path.exists(image_path):
                print(f"Error: Image {i+1} not found at {image_path}")
                continue
                
            with open(log_file_path, 'a') as log_file:
                path = image_path.replace('\\', '/')
                log_file.write(f"'{path}',\n")
        except Exception as e:
            print(f"Error uploading image {i+1}: {str(e)}")