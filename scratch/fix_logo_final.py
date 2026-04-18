from PIL import Image

def finalize_transparency(input_path, output_path):
    print(f"Aggressively stripping artifacts from: {input_path}")
    try:
        img = Image.open(input_path).convert("RGBA")
        width, height = img.size
        datas = img.getdata()

        # Sample the corners to find the "box" color
        corners = [datas[0], datas[width-1], datas[(height-1)*width], datas[height*width-1]]
        bg_r, bg_g, bg_b, _ = corners[0]
        print(f"Sampled Background Color: ({bg_r}, {bg_g}, {bg_b})")

        new_data = []
        for item in datas:
            r, g, b, a = item
            
            # Distance from the sampled background color
            dist = ((r - bg_r)**2 + (g - bg_g)**2 + (b - bg_b)**2)**0.5
            
            if dist < 45:  # Aggressive threshold for "near-background" pixels
                # Smoothly fade transparency for anti-aliased edges
                alpha = int(max(0, min(255, (dist - 10) * (255 / 35))))
                new_data.append((r, g, b, alpha))
            else:
                new_data.append(item)

        img.putdata(new_data)
        img.save(output_path, "PNG")
        print(f"Success! True alpha-transparent logo saved to: {output_path}")
        return True
    except Exception as e:
        print(f"Extraction Error: {e}")
        return False

input_file = r"c:\SadTalker\farm-finance\public\BRAES-CREEK-FINAL-MASTER.png"
output_file = r"c:\SadTalker\farm-finance\public\logo-transparent-v3.png"

finalize_transparency(input_file, output_file)
