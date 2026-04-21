from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import torch
import torchvision.transforms as transforms
import io

app = FastAPI()

# Allow React to talk to this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load pretrained MobileNet model (downloads automatically first time)
model = torch.hub.load(
    "pytorch/vision:v0.10.0",
    "mobilenet_v2",
    pretrained=True
)
model.eval()

# ImageNet labels — we'll use these to detect dogs
IMAGENET_LABELS_URL = "https://raw.githubusercontent.com/anishathalye/imagenet-simple-labels/master/imagenet-simple-labels.json"

import urllib.request, json
with urllib.request.urlopen(IMAGENET_LABELS_URL) as url:
    LABELS = json.load(url)

# ImageNet has dog breeds from index 151 to 268
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

@app.post("/detect")
async def detect_dog(file: UploadFile = File(...)):
    # Read and preprocess image
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    tensor = preprocess(image)

    # Run through AI model
    with torch.no_grad():
        output = model(tensor)

    probabilities = torch.nn.functional.softmax(output[0], dim=0)
    top5 = torch.topk(probabilities, 5)

    # Check if any top result is a dog breed
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