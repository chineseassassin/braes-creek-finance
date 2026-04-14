from PIL import Image

def make_transparent_soft(file_path):
    try:
        img = Image.open(file_path).convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            r, g, b, a = item
            
            # If already transparent, keep it
            if a == 0:
                newData.append(item)
                continue
                
            # If all channels are very close to white, make perfectly transparent
            if r > 240 and g > 240 and b > 240:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)

        img.putdata(newData)
        img.save(file_path, "PNG")
        print(f"Processed: {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

files = [
    r"C:\SadTalker\farm-finance\public\logo.png",
    r"C:\SadTalker\braes-creek-estate\BRAES CREET ESTATE -2026 png.png",
    r"C:\SadTalker\braes-creek-estate\BRAES CREET ESTATE -2026.png"
]

for f in files:
    make_transparent_soft(f)
