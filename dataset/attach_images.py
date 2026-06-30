import pandas as pd
from image_map import get_image_from_name

df = pd.read_csv("products_dataset_cleaned.csv")

df["image_url"] = df["product_name"].apply(get_image_from_name)

df.to_csv("products_with_images.csv", index=False)

print("✅ Images correctly mapped using product_name")
print(df[["product_name", "image_url"]].head(10))
