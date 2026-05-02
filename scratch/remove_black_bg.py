from PIL import Image
import sys

def remove_black_background(file_path, threshold=30):
    try:
        img = Image.open(file_path).convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            r, g, b, a = item
            
            # If the pixel is very dark (close to black), make it transparent
            if r < threshold and g < threshold and b < threshold:
                newData.append((0, 0, 0, 0))
            else:
                newData.append(item)

        img.putdata(newData)
        img.save(file_path, "PNG")
        print(f"Successfully processed: {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python remove_black_bg.py <file_path>")
    else:
        remove_black_background(sys.argv[1])
