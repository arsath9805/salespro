import pandas as pd

df = pd.read_csv("products_dataset_cleaned.csv")

print("📊 Total records:", len(df))

# 1️⃣ Check missing values
print("\n🔍 Missing values per column:")
print(df.isnull().sum())

# 2️⃣ Check negative or invalid values
invalid_quantity = df[df["quantity"] < 0]
invalid_cost = df[df["per_cost"] <= 0]

print("\n❌ Invalid quantity rows:", len(invalid_quantity))
print("❌ Invalid cost rows:", len(invalid_cost))

# 3️⃣ Threshold logic check
invalid_threshold = df[df["threshold"] <= 0]
print("❌ Invalid threshold rows:", len(invalid_threshold))

# 4️⃣ Status consistency check
wrong_status = df[
    ((df["quantity"] <= df["threshold"]) & (df["status"] != "Low Stock")) |
    ((df["quantity"] > df["threshold"]) & (df["status"] != "In Stock"))
]

print("❌ Incorrect status rows:", len(wrong_status))

print("\n✅ Validation complete")
