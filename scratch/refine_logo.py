from PIL import Image
import sys

def remove_dark_shadows(file_path, threshold=80):
    try:
        img = Image.open(file_path).convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            r, g, b, a = item
            
            # If the pixel is dark (including shadows), make it transparent
            # Also handle semi-transparent dark pixels if they exist
            if r < threshold and g < threshold and b < threshold:
                newData.append((0, 0, 0, 0))
            else:
                newData.append(item)

        img.putdata(newData)
        img.save(file_path, "PNG")
        print(f"Successfully refined: {file_path} (Threshold: {threshold})")
    except Exception as e:
        print(f"Error refining {file_path}: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python refine_logo.py <file_path> [threshold]")
    else:
        t = int(sys.argv[2]) if len(sys.argv) > 2 else 80
        remove_dark_shadows(sys.argv[1], t)
