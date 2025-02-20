import discord
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
# Get token from environment variables
DISCORD_TOKEN = os.getenv('DISCORD_TOKEN')

intents = discord.Intents.default()
intents.message_content = True

bot = discord.Client(intents=intents)

@bot.event
async def on_ready():
    print(f'We have logged in as {bot.user}')

    target_guild = bot.guilds[0]
    target_channel = None
    
    for channel in target_guild.channels:
        if isinstance(channel, discord.TextChannel) and channel.name == 'strinova-emotes':
            target_channel = channel
            break

    if target_channel:
        print(f"Selected channel: {target_channel.name}")
        await upload_images(target_channel)
        await bot.close()
    else:
        print("No text channels found.")
        await bot.close()

async def upload_images(channel):
    # Get the directory of the current script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Path to the emotes folder
    # emotes_folder_name = 'EmotesWiki'
    emotes_folder_name = 'ChatEmote'
    emotes_dir = os.path.join(script_dir, emotes_folder_name)

    # Path to the log file
    # log_file_path = os.path.join(script_dir, 'emote_urls.txt')
    log_file_path = os.path.join(script_dir, 'chat_emote_urls.txt')

    image_files = []
    for file in os.listdir(emotes_folder_name):
        image_files.append(os.path.join(emotes_dir, file))
    
    # Check if we found any images
    if not image_files:
        print(f"No image files found in the '{emotes_folder_name}' folder")
        return
    
    for i, image_path in enumerate(image_files):
        try:
            # Check if file exists
            if not os.path.exists(image_path):
                print(f"Error: Image {i+1} not found at {image_path}")
                continue
                
            # Upload the image file
            file = discord.File(image_path)
            message = await channel.send(f"", file=file)
            
            # Get the URL of the uploaded image
            if message.attachments:
                image_url = message.attachments[0].url
                print(f"Image {i+1}/{len(image_files)} uploaded successfully!")
                # print(f"URL: {image_url}")
                with open(log_file_path, 'a') as log_file:
                    log_file.write(f"'{image_url}',\n")
            else:
                print(f"Failed to get URL for image {i+1}")
        except Exception as e:
            print(f"Error uploading image {i+1}: {str(e)}")

@bot.event
async def on_message(message):
    if message.author == bot.user:
        return

    # if message.content.startswith('$hello'):
    #     await message.channel.send('Hello!')

bot.run(DISCORD_TOKEN)