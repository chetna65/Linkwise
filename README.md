# Linkwise: Phishing Domain Detection

**Linkwise** is a machine learning system for detecting phishing websites strictly from domain-level textual characteristics, featuring a lightweight FastAPI backend and a React + Vite dashboard. The system extracts 20 lexical and structural features directly from input strings—such as entropy, character runs, keyword counts, and TLD characteristics—without ever opening, crawling, or making network requests to the target URL. Because real-world domain-only classification is inherently noisy and prone to flagging benign sites, the deployed model operates at a conservative probability threshold of 0.9; this setup deliberately prioritizes high precision over detection coverage, identifying only obvious suspicious domains while missing the vast majority of phishing attempts.

## Folder Structure

```text
Phishing-Detection/
├── backend/
│   └── api.py                   # FastAPI service for checking domains
├── frontend/
│   ├── public/
│   │   └── plots/               # Evaluation plots (ROC curves, confusion matrices, SHAP)
│   ├── src/
│   │   ├── data/
│   │   │   └── results.js       # Benchmark metrics and threshold experiment data
│   │   ├── App.jsx              # Single-page shell with sticky header and navigation
│   │   ├── Architecture.jsx     # Inference pipeline and scope limitations panel
│   │   ├── brand.js             # Brand constant definitions (Linkwise)
│   │   ├── DetailedAnalysis.jsx # Takeaways, overfitting analysis, confusion matrix, plots
│   │   ├── Performance.jsx      # Performance dashboard, metric comparison, benchmark matrix, threshold curves
│   │   ├── Scanner.jsx          # Interactive single-domain inspection UI
│   │   ├── index.css            # Tailwind CSS styling
│   │   └── main.jsx             # React entry point
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
├── models/
│   ├── archive/
│   │   ├── phishing_model.pkl   # Archived pickle model artifact
│   │   └── uci_xgb_benchmark.pkl # Archived UCI benchmark pickle artifact
│   └── xgb_model.json           # Trained domain-level XGBoost model (JSON format)
├── src/
│   ├── __init__.py
│   └── features.py              # 20 URL-only domain feature extraction routines
├── .gitignore
├── README.md
└── requirements-api.txt         # Pinned Python dependencies for the backend
```

## Setup and Running

### 1. Backend Setup & Run

The backend is a FastAPI application running on port `8000`. Run all backend commands from the **project root**:

```bash
# Install Python dependencies
pip install -r requirements-api.txt

# Start the API server
python -m uvicorn backend.api:app --reload --port 8000
```

Once running, the backend exposes:
- Health and documentation: `http://localhost:8000/docs`
- Domain check endpoint: `POST http://localhost:8000/api/check` with payload `{"url": "example.com"}`

### 2. Frontend Setup & Run

The frontend is built with React 19, Tailwind CSS, and Vite, running on port `5173`. Run all frontend commands from the **`frontend/`** directory:

```bash
# Navigate to the frontend directory
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```

The frontend application will be accessible at `http://localhost:5173/`.

---

## Results Summary

All figures below are taken directly from the project benchmark evaluations recorded in `frontend/src/data/results.js`.

### Experiment A: UCI Benchmark

Evaluated on the UCI Phishing Websites dataset, deduplicated to 5,849 unique rows with 30 pre-computed features (which include external/HTML signals such as SSL state, anchor tags, and form actions) using an 80/20 stratified split (1,170 test rows: 566 legitimate, 604 phishing).

| Model | Test Accuracy | Precision | Recall | F1 | ROC-AUC | Train Time | False Negatives (out of 604) |
|---|---|---|---|---|---|---|---|
| Logistic Regression | 0.9179 | 0.9247 | 0.9156 | 0.9201 | 0.9776 | 0.0212 s | 51 |
| Decision Tree | 0.9111 | 0.9266 | 0.899 | 0.9126 | 0.9178 | 0.0193 s | 61 |
| Random Forest | 0.9402 | 0.9572 | 0.9255 | 0.9411 | 0.9852 | 0.8598 s | 45 |
| SVM | 0.9359 | 0.9475 | 0.9272 | 0.9372 | 0.9842 | 2.3673 s | 44 |
| XGBoost | 0.9513 | 0.9581 | 0.947 | 0.9525 | 0.993 | 0.1242 s | 32 |
| XGBoost (tuned) | 0.9556 | – | 0.9487 | 0.9566 | 0.993 | – | – |
| Random Forest (tuned) | 0.9427 | – | 0.9255 | 0.9435 | 0.9902 | – | – |

*Note: The high metrics on the UCI dataset rely heavily on features derived from web page content and certificates that cannot be extracted from a bare URL string.*

### Experiment B: URL-Only (Domain Level)

Evaluated on PhiUSIIL reduced to one row per registered domain: 175,206 domains (24.7% phishing) using 20 URL-only textual features. Evaluated on an 80/20 stratified split (about 35,000 test rows) with class weighting applied.

- **Majority-class baseline accuracy:** 0.7528 (predicting legitimate for every domain yields 75.3%)
- **Tuned XGBoost domain-level accuracy:** 0.7786 (barely higher than the baseline)

| Model | Precision | Recall | F1 | ROC-AUC | PR-AUC | Train Time |
|---|---|---|---|---|---|---|
| Logistic Regression | 0.5212 | 0.4376 | 0.4757 | 0.6888 | 0.5538 | 4.2334 s |
| Decision Tree | 0.563 | 0.4327 | 0.4893 | 0.7093 | 0.5489 | 1.1818 s |
| Random Forest | 0.4854 | 0.4417 | 0.4625 | 0.6906 | 0.5542 | 59.9758 s |
| SVM (20k subsample) | 0.567 | 0.4134 | 0.4782 | 0.7021 | 0.5183 | 152.5188 s |
| XGBoost | 0.5448 | 0.4628 | 0.5005 | 0.7301 | 0.5959 | 2.8511 s |
| XGBoost (tuned) | 0.5657 | 0.4499 | 0.5012 | – | 0.5963 | – |

### Classification Threshold Sweep (Domain Level)

Evaluating classification cutoffs across the test split demonstrates the trade-off between false alarms on popular sites and catching phishing attacks:

| Cutoff | Precision | Recall | % Test Set Flagged | Tranco Top-1,000 Domains Flagged | Deployed Status |
|---|---|---|---|---|---|
| 0.5 | 0.566 | 0.45 | 19.7% | 242 | Not used |
| 0.6 | 0.675 | 0.387 | 14.2% | 144 | Not used |
| 0.7 | 0.783 | 0.331 | 10.5% | 112 | Not used |
| 0.8 | 0.897 | 0.258 | 7.1% | 61 | Not used |
| 0.9 | 0.973 | 0.211 | 5.4% | 23 | **Active in API** |

---

## Limitations

- **Not a Reliable Phishing Detector:** This application is an educational and exploratory project, **not** a reliable phishing detection tool. It must not be relied upon as a security defense.
- **Analyses Domains Only, Never Opens URLs:** The model operates strictly on the textual representation of the domain/URL string using static parsing rules. It never contacts DNS, never connects to host servers, never fetches HTTP responses, and never inspects SSL certificates or page HTML.
- **Misses Most Phishing by Design:** At the standard 0.5 threshold, the model generated unacceptably high false-positive rates (flagging 242 of the Tranco top-1,000 legitimate sites). Consequently, the deployed backend strictly requires a probability score of at least **0.9** before labeling an input as phishing. While this raises test precision to 0.973, it drops recall to **0.211 (about 0.21)**—meaning the model misses roughly 79% of all phishing domains.
- **Shared Hosting Blind Spots:** Phishing sites hosted on legitimate multi-tenant or shared hosting domains (such as `firebaseapp.com`, `github.io`, `vercel.app`, `netlify.app`, `blogspot.com`, etc.) cannot be distinguished from benign pages via domain text alone. The backend explicitly marks all such platforms as `unknown`.
- **Threshold Optimism:** The 0.9 cutoff was selected from a threshold sweep conducted directly on the test split, making the resulting 0.973 precision and 0.211 recall figures slightly optimistic compared to real-world deployment.
