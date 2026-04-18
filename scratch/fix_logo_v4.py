from PIL import Image, ImageOps

def create_alpha_mask_logo(input_path, output_path):
    print(f"Synthesizing Alpha-Mask for: {input_path}")
    try:
        # Load image
        img = Image.open(input_path).convert("RGBA")
        
        # Create a grayscale version to use as a mask
        grayscale = ImageOps.grayscale(img)
        
        # Enhance the contrast of the mask to ensure the gold tree is solid 
        # but the black background is completely gone.
        mask = grayscale.point(lambda x: 0 if x < 20 else min(255, int(x * 1.2)))
        
        # Apply the mask to the alpha channel
        new_img = img.copy()
        new_img.putalpha(mask)
        
        new_img.save(output_path, "PNG")
        print(f"Success! Alpha-Masked logo saved to: {output_path}")
        return True
    except Exception as e:
        print(f"Synthesis Error: {e}")
        return False

# Target the master logo
input_file = r"c:\SadTalker\farm-finance\public\BRAES-CREEK-FINAL-MASTER.png"
output_file = r"c:\SadTalker\farm-finance\public\logo-transparent-v4.png"

create_alpha_mask_logo(input_file, output_file)
