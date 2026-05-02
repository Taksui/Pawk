from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import torch
import torchvision.transforms as transforms
import io
import numpy as np
import urllib.request, json

# ── CLIP for embeddings ──────────────────────────────────────────
from sentence_transformers import SentenceTransformer
clip_model = SentenceTransformer("clip-ViT-B-32")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── MobileNet for dog detection ──────────────────────────────────
mobilenet = torch.hub.load(
    "pytorch/vision:v0.10.0",
    "mobilenet_v2",
    pretrained=True
)
mobilenet.eval()

IMAGENET_LABELS_URL = "https://raw.githubusercontent.com/anishathalye/imagenet-simple-labels/master/imagenet-simple-labels.json"
with urllib.request.urlopen(IMAGENET_LABELS_URL) as url:
    LABELS = json.load(url)

DOG_INDICES = set(range(151, 269))

def preprocess(image: Image.Image):
    transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        ),
    ])
    return transform(image).unsqueeze(0)

# ── In-memory store for embeddings ──────────────────────────────
# Each entry: { "id": str, "embedding": list[float] }
saved_embeddings = []

def cosine_similarity(a, b):
    a, b = np.array(a), np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

# ── Routes ───────────────────────────────────────────────────────

@app.post("/detect")
async def detect_dog(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    tensor = preprocess(image)

    with torch.no_grad():
        output = mobilenet(tensor)

    probabilities = torch.nn.functional.softmax(output[0], dim=0)
    top5 = torch.topk(probabilities, 5)

    is_dog = False
    confidence = 0.0
    label = ""

    for score, idx in zip(top5.values, top5.indices):
        if idx.item() in DOG_INDICES:
            is_dog = True
            confidence = round(score.item() * 100, 2)
            label = LABELS[idx.item()]
            break

    return {
        "is_dog": is_dog,
        "confidence": confidence,
        "label": label if is_dog else "Not a dog",
    }


@app.post("/embed")
async def embed_and_match(file: UploadFile = File(...), pin_id: str = ""):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")

    # Generate embedding using CLIP
    embedding = clip_model.encode(image).tolist()

    # Compare with saved embeddings
    best_match_id = None
    best_score = 0.0
    THRESHOLD = 0.90  # 90% similar = same dog

    for saved in saved_embeddings:
        score = cosine_similarity(embedding, saved["embedding"])
        if score > best_score:
            best_score = score
            best_match_id = saved["id"]

    is_match = best_score >= THRESHOLD

    # Save this embedding if it's a new dog
    if not is_match and pin_id:
        saved_embeddings.append({
            "id": pin_id,
            "embedding": embedding
        })

    return {
        "is_match": is_match,
        "matched_pin_id": best_match_id if is_match else None,
        "similarity": round(best_score * 100, 2),
        "embedding": embedding,
    }