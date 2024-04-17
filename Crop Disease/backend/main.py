from fastapi import FastAPI, UploadFile, HTTPException, Body
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline
from PIL import Image
import base64
from io import BytesIO

app = FastAPI()

# Load the image classification pipeline
classifier = pipeline(model="Diginsa/Plant-Disease-Detection-Project")

# CORS configuration
origins = [""]  # Replace "" with the actual list of allowed origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint to perform image classification
@app.post("/classify")
async def classify_image(encoded_image: str= Body(..., embed=True)):
    try:
        # Decode the base64 encoded image string
        decoded_image = base64.b64decode(encoded_image)

        # Create an Image object from the decoded content
        image = Image.open(BytesIO(decoded_image))

        # Use the classifier with the decoded image
        result = classifier(images=image)

        # Return the classification result as JSON
        return JSONResponse(content=result, status_code=200)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))