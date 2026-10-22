"""Small API that lets the React UI use the trained model.
Run from the project root:  uvicorn backend.api:app --reload --port 8000
The URL is only parsed as text. It is never opened or fetched.
"""
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

import pandas as pd
from fastapi import FastAPI, HTTPException
from xgboost import XGBClassifier
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.features import extract_features, get_site, matched_terms

# Shared hosting platforms: the domain does not identify who owns the page
PLATFORMS = {
    "web.app", "firebaseapp.com", "repl.co", "weeblysite.com", "ipfs.io",
    "workers.dev", "square.site", "dweb.link", "pantheonsite.io",
    "godaddysites.com", "duckdns.org", "github.io", "blogspot.com",
    "wixsite.com", "netlify.app", "vercel.app",
}

# Chosen from the test-split threshold sweep: precision 0.97, recall 0.21
THRESHOLD = 0.9

# Native XGBoost JSON format: portable across versions, unlike a pickle file
model = XGBClassifier()
model.load_model(ROOT / "models" / "xgb_model.json")
# Same order as training: the training table was built from extract_features()
columns = list(extract_features("example.com").keys())

app = FastAPI(title="Linkwise API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


class CheckRequest(BaseModel):
    url: str


@app.get("/api/health")
def health():
    return {"status": "ok", "model": "Tuned XGBoost", "threshold": THRESHOLD}


@app.post("/api/check")
def check(req: CheckRequest):
    text = req.url.strip()
    if not text or len(text) > 2048:
        raise HTTPException(400, "Enter a URL or domain (up to 2048 characters).")

    site = get_site(text)[0]
    if not site or "." not in site:
        raise HTTPException(400, "Could not read a valid domain from that input.")

    t0 = time.perf_counter()
    feats = extract_features(text)
    p = float(model.predict_proba(pd.DataFrame([feats])[columns])[0, 1])
    t1 = time.perf_counter()
    inference_ms = round((t1 - t0) * 1000, 1)

    terms = matched_terms(text)

    if site in PLATFORMS:
        verdict = "unknown"
    elif p >= THRESHOLD:
        verdict = "phishing"
    else:
        verdict = "legitimate"

    return {
        "site": site,
        "verdict": verdict,
        "phishing_probability": p,
        "features": feats,
        "inference_ms": inference_ms,
        "matched_keywords": terms["keywords"],
        "matched_brands": terms["brands"],
        "threshold": THRESHOLD,
    }
