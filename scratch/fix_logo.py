from PIL import Image, ImageFilter

def extract_logo_transparency(input_path, output_path):
    print(f"Synthesizing transparency for: {input_path}")
    try:
        # Load and convert to RGBA
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()

        new_data = []
        for item in datas:
            r, g, b, a = item
            
            # Distance from black (0,0,0)
            # This handles baked-in black backgrounds
            brightness = (r + g + b) / 3
            
            if brightness < 15:  # Very close to black
                new_data.append((0, 0, 0, 0))
            elif brightness < 40: # Soft edge transition
                alpha = int((brightness - 15) * (255 / (40 - 15)))
                new_data.append((r, g, b, alpha))
            else:
                new_data.append(item)

        img.putdata(new_data)
        
        # Apply a very slight blur to the alpha channel only to smooth edges if needed
        # But for text, sharpness is better, so we'll stay with the calculated alpha.
        
        img.save(output_path, "PNG")
        print(f"Success! Optimized logo saved to: {output_path}")
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

# Target the master logo
input_file = r"c:\SadTalker\farm-finance\public\BRAES-CREEK-FINAL-MASTER.png"
output_file = r"c:\SadTalker\farm-finance\public\logo-transparent-v2.png"

extract_logo_transparency(input_file, output_file)
