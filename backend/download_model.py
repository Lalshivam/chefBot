"""
Download the Qwen model from Hugging Face if it doesn't exist locally.
This script is run during deployment on Render.
"""
import os
from huggingface_hub import snapshot_download

MODEL_NAME = "Qwen/Qwen2.5-0.5B-Instruct"
MODEL_PATH = "./models/Qwen2.5-0.5B-Instruct"

def download_model():
    """Download model if it doesn't exist"""
    model_file = os.path.join(MODEL_PATH, "model.safetensors")

    if os.path.exists(model_file):
        print(f"Model already exists at {MODEL_PATH}")
        return

    print(f"Downloading model {MODEL_NAME}...")
    print("This may take several minutes...")

    try:
        snapshot_download(
            repo_id=MODEL_NAME,
            local_dir=MODEL_PATH,
            local_dir_use_symlinks=False,
            resume_download=True
        )
        print("Model downloaded successfully!")
    except Exception as e:
        print(f"Error downloading model: {e}")
        print("Please check your internet connection and try again.")
        raise

if __name__ == "__main__":
    download_model()
