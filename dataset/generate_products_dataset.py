import pandas as pd
import random
from datetime import datetime, timedelta

# Number of rows (change between 500–1000)
NUM_ROWS = 750

# Sample master data
products = [
    ("Laptop", "Electronics", 45000, 75000),
    ("Phone", "Electronics", 12000, 30000),
    ("Tablet", "Electronics", 18000, 45000),
    ("Headphones", "Accessories", 1500, 5000),
    ("Smart Watch", "Accessories", 3000, 12000),
    ("Keyboard", "Accessories", 800, 2500),
    ("Mouse", "Accessories", 500, 2000),
    ("Monitor", "Electronics", 8000, 35000),
    ("Printer", "Electronics", 9000, 28000),
    ("Power Bank", "Accessories", 1000, 4000),
]

suppliers = ["Dell", "HP", "Samsung", "Apple", "Boat", "Lenovo", "Asus", "Sony"]
data = []

start_date = datetime(2023, 1, 1)

for i in range(NUM_ROWS):
    product_base, category, min_cost, max_cost = random.choice(products)
    product_id = f"P{str(i+1).zfill(4)}"

    product_name = f"{product_base} {random.randint(100,999)}"
    quantity = random.randint(0, 300)
    per_cost = random.randint(min_cost, max_cost)
    total_cost = quantity * per_cost

    threshold = random.randint(10, 50)
    status = "Low Stock" if quantity <= threshold else "In Stock"

    supplier = random.choice(suppliers)
    last_updated = start_date + timedelta(days=random.randint(0, 365))

    data.append([
        product_id,
        product_name,
        category,
        quantity,
        per_cost,
        total_cost,
        threshold,
        supplier,
        status,
        last_updated.strftime("%Y-%m-%d")
    ])

# Create DataFrame
columns = [
    "product_id",
    "product_name",
    "category",
    "quantity",
    "per_cost",
    "total_cost",
    "threshold",
    "supplier",
    "status",
    "last_updated"
]

df = pd.DataFrame(data, columns=columns)

# Save CSV
df.to_csv("products_dataset.csv", index=False)

print("✅ Dataset generated successfully: products_dataset.csv")
print(f"📊 Total records: {len(df)}")
