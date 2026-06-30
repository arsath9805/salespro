import random

IMAGE_MAP = {
    "laptop": [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853"
    ],
    "keyboard": [
        "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04",
        "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef"
    ],
    "mouse": [
        "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7",
        "https://images.unsplash.com/photo-1629429408209-1f912961dbd8"
    ],
    "printer": [
        "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6"
    ],
    "tablet": [
        "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5"
    ],
    "phone": [
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"
    ],
    "monitor": [
        "https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc"
    ],
    "watch": [
        "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b"
    ],
    "power": [
        "https://images.unsplash.com/photo-1609592422031-5b17fbd5c5b1"
    ]
}

DEFAULT_IMAGE = "https://images.unsplash.com/photo-1581090700227-1e37b190418e"

def get_image_from_name(product_name):
    name = product_name.lower()

    for key, images in IMAGE_MAP.items():
        if key in name:
            return random.choice(images)

    return DEFAULT_IMAGE
