import pandas as pd
import firebase_admin
from firebase_admin import credentials, firestore

# 🔑 Load service account key
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# 📂 Read the updated dataset
df = pd.read_csv("products_with_images.csv")

collection_ref = db.collection("products")

count = 0

for _, row in df.iterrows():
    doc_id = row["product_id"]  # P001, P002, etc.

    collection_ref.document(doc_id).set({
        "product_id": row["product_id"],
        "product_name": row["product_name"],
        "category": row["category"],
        "quantity": int(row["quantity"]),
        "per_cost": int(row["per_cost"]),
        "total_cost": int(row["total_cost"]),
        "threshold": int(row["threshold"]),
        "supplier": row["supplier"],
        "status": row["status"],
        "last_updated": row["last_updated"],
        "image_url": row["image_url"]   # ⭐ VERY IMPORTANT
    })

    count += 1

print(f"✅ {count} products uploaded successfully to Firestore")
