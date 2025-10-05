from PIL import Image
import os

def resize_images(folder_path, max_size=256):
    """
    Resize images in folder if they exceed max_size in either dimension.
    
    Args:
        folder_path: Path to the folder containing images
        max_size: Maximum width/height (default 256)
    """
    # Supported image formats
    supported_formats = ('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp')
    
    # Check if folder exists
    if not os.path.exists(folder_path):
        print(f"Error: Folder '{folder_path}' not found!")
        return
    
    # Count processed images
    resized_count = 0
    skipped_count = 0
    error_count = 0
    
    # Scan through all files in the folder
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        
        # Skip if not a file
        if not os.path.isfile(file_path):
            continue
        
        # Skip if not an image
        if not filename.lower().endswith(supported_formats):
            continue
        
        try:
            # Open the image
            with Image.open(file_path) as img:
                width, height = img.size
                
                # Check if image needs resizing
                if width > max_size or height > max_size:
                    print(f"Resizing: {filename} ({width}x{height}) -> ({max_size}x{max_size})")
                    
                    # Resize image to 256x256
                    resized_img = img.resize((max_size, max_size), Image.Resampling.LANCZOS)
                    
                    # Save the resized image (overwrite original)
                    resized_img.save(file_path)
                    resized_count += 1
                else:
                    print(f"Skipping: {filename} ({width}x{height}) - already small enough")
                    skipped_count += 1
                    
        except Exception as e:
            print(f"Error processing {filename}: {str(e)}")
            error_count += 1
    
    # Print summary
    print("\n" + "="*50)
    print(f"Processing complete!")
    print(f"Resized: {resized_count} images")
    print(f"Skipped: {skipped_count} images")
    print(f"Errors: {error_count} images")
    print("="*50)

if __name__ == "__main__":
    # Specify your folder path
    folder_path = "EmotesWikiExtra"
    
    # Run the resize function
    resize_images(folder_path)