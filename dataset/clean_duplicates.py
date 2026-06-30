import pandas as pd

# Load dataset
df = pd.read_csv("products_dataset.csv")

print("📊 Original records:", len(df))

# 🔍 Check duplicate product_id
duplicate_count = df.duplicated(subset=["product_id"]).sum()
print("❌ Duplicate product_id count:", duplicate_count)

# 🧹 Remove duplicates (keep first occurrence)
df_cleaned = df.drop_duplicates(subset=["product_id"], keep="first")

print("✅ Records after removing duplicates:", len(df_cleaned))

# Save cleaned dataset
df_cleaned.to_csv("products_dataset_cleaned.csv", index=False)

print("🎉 Cleaned dataset saved as: products_dataset_cleaned.csv")

