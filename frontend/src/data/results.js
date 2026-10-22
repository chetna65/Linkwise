const fmtTime = (v) => (v == null ? "–" : `${v.toFixed(1)} s`);

export const DATASETS = {
  A: {
    tab: "UCI benchmark",
    sampleLabel: "5,849 rows",
    splitLabel: "80/20 stratified hold-out",
    title: "Experiment A: UCI benchmark",
    description:
      "UCI Phishing Websites, deduplicated: 5,849 unique rows with 30 pre-made features. 80/20 stratified split (1,170 test rows: 566 legitimate, 604 phishing).",
    metrics: [
      { key: "f1", label: "F1" },
      { key: "recall", label: "Recall" },
      { key: "precision", label: "Precision" },
      { key: "rocAuc", label: "ROC-AUC" },
      { key: "testAcc", label: "Test accuracy" },
    ],
    columns: [
      { key: "testAcc", label: "Test acc" },
      { key: "precision", label: "Precision" },
      { key: "recall", label: "Recall" },
      { key: "f1", label: "F1" },
      { key: "rocAuc", label: "ROC-AUC" },
      { key: "cvF1", label: "CV F1" },
      { key: "cvStd", label: "CV std", lowerIsBetter: true },
      { key: "time", label: "Train time", lowerIsBetter: true, fmt: fmtTime },
    ],
    models: [
      { name: "Logistic Regression", trainAcc: 0.9237, testAcc: 0.9179, precision: 0.9247, recall: 0.9156, f1: 0.9201, rocAuc: 0.9776, cvF1: 0.9229, cvStd: 0.0025, time: 0.0212, confusion: { tn: 521, fp: 45, fn: 51, tp: 553 } },
      { name: "Decision Tree", trainAcc: 0.9919, testAcc: 0.9111, precision: 0.9266, recall: 0.899, f1: 0.9126, rocAuc: 0.9178, cvF1: 0.9221, cvStd: 0.0032, time: 0.0193, confusion: { tn: 523, fp: 43, fn: 61, tp: 543 } },
      { name: "Random Forest", trainAcc: 0.9919, testAcc: 0.9402, precision: 0.9572, recall: 0.9255, f1: 0.9411, rocAuc: 0.9852, cvF1: 0.9489, cvStd: 0.0049, time: 0.8598, confusion: { tn: 541, fp: 25, fn: 45, tp: 559 } },
      { name: "SVM", trainAcc: 0.9541, testAcc: 0.9359, precision: 0.9475, recall: 0.9272, f1: 0.9372, rocAuc: 0.9842, cvF1: 0.9396, cvStd: 0.005, time: 2.3673, confusion: { tn: 535, fp: 31, fn: 44, tp: 560 } },
      { name: "XGBoost", trainAcc: 0.9853, testAcc: 0.9513, precision: 0.9581, recall: 0.947, f1: 0.9525, rocAuc: 0.993, cvF1: 0.9503, cvStd: 0.0058, time: 0.1242, confusion: { tn: 541, fp: 25, fn: 32, tp: 572 } },
      { name: "XGBoost (tuned)", tuned: true, testAcc: 0.9556, recall: 0.9487, f1: 0.9566, rocAuc: 0.993 },
      { name: "Random Forest (tuned)", tuned: true, testAcc: 0.9427, recall: 0.9255, f1: 0.9435, rocAuc: 0.9902 },
    ],
    takeaways: [
      "XGBoost leads on this split (F1 0.953, recall 0.947, ROC-AUC 0.993). Tuning raised F1 to 0.957, a small gain that is within noise.",
      "Decision Tree overfits: 99.2% training accuracy against 91.1% test accuracy. Random Forest also has a large gap (99.2% vs 94.0%) but generalises better because it averages many trees.",
      "Missed phishing sites (false negatives, out of 604): XGBoost 32, SVM 44, Random Forest 45, Logistic Regression 51, Decision Tree 61.",
      "Random Forest, SVM and XGBoost are close (cross-validation std is about 0.005), so do not read their ranking as precise.",
    ],
    caveat:
      "This benchmark's strongest features (SSL state, anchor URLs, form handlers) need certificates or page HTML. A live app that only sees a URL cannot reproduce this performance.",
    plots: [{ file: "roc_curves.png", title: "ROC curves, UCI benchmark" }],
  },

  B: {
    tab: "URL-only (domain level)",
    sampleLabel: "175,206 domains",
    splitLabel: "80/20 stratified hold-out",
    title: "Experiment B: URL-only, domain level",
    description:
      "PhiUSIIL reduced to one row per domain: 175,206 domains (24.7% phishing) with 20 URL-only features written for this project. 80/20 stratified split (about 35,000 test rows), class weights applied.",
    metrics: [
      { key: "f1", label: "F1" },
      { key: "recall", label: "Recall" },
      { key: "precision", label: "Precision" },
      { key: "prAuc", label: "PR-AUC" },
      { key: "rocAuc", label: "ROC-AUC" },
    ],
    columns: [
      { key: "precision", label: "Precision" },
      { key: "recall", label: "Recall" },
      { key: "f1", label: "F1" },
      { key: "rocAuc", label: "ROC-AUC" },
      { key: "prAuc", label: "PR-AUC" },
      { key: "time", label: "Train time", lowerIsBetter: true, fmt: fmtTime },
    ],
    models: [
      { name: "Logistic Regression", precision: 0.5212, recall: 0.4376, f1: 0.4757, rocAuc: 0.6888, prAuc: 0.5538, time: 4.2334 },
      { name: "Decision Tree", precision: 0.563, recall: 0.4327, f1: 0.4893, rocAuc: 0.7093, prAuc: 0.5489, time: 1.1818 },
      { name: "Random Forest", precision: 0.4854, recall: 0.4417, f1: 0.4625, rocAuc: 0.6906, prAuc: 0.5542, time: 59.9758 },
      { name: "SVM (20k subsample)", precision: 0.567, recall: 0.4134, f1: 0.4782, rocAuc: 0.7021, prAuc: 0.5183, time: 152.5188 },
      { name: "XGBoost", precision: 0.5448, recall: 0.4628, f1: 0.5005, rocAuc: 0.7301, prAuc: 0.5959, time: 2.8511 },
      { name: "XGBoost (tuned)", tuned: true, precision: 0.5657, recall: 0.4499, f1: 0.5012, prAuc: 0.5963 },
    ],
    thresholds: [
      { cutoff: 0.5, precision: 0.566, recall: 0.45, flagged: "19.7%", tranco: 242 },
      { cutoff: 0.6, precision: 0.675, recall: 0.387, flagged: "14.2%", tranco: 144 },
      { cutoff: 0.7, precision: 0.783, recall: 0.331, flagged: "10.5%", tranco: 112 },
      { cutoff: 0.8, precision: 0.897, recall: 0.258, flagged: "7.1%", tranco: 61 },
      { cutoff: 0.9, precision: 0.973, recall: 0.211, flagged: "5.4%", tranco: 23, used: true },
    ],
    shortcut: [
      { name: "4-feature structural tree, raw URLs", value: 0.9956 },
      { name: "Tuned XGBoost, domain level", value: 0.7786 },
    ],
    baselineAccuracy: 0.7528,
    takeaways: [
      "All five models land in a narrow band (F1 0.46 to 0.50). When different algorithms agree, the limit is usually the data or features, not the model.",
      "Tuned XGBoost reaches 77.9% accuracy. Predicting legitimate for every domain gives 75.3%, so the model is only slightly better than doing nothing.",
      "At the default 0.5 cutoff, 242 of the Tranco top-1,000 most popular domains were flagged as phishing.",
      "Raising the cutoff to 0.9 gives 97% precision but only 21% recall: the app flags obvious cases and misses most phishing.",
    ],
    caveat:
      "The 0.9 cutoff was chosen from a sweep on the test split, so those precision and recall figures are slightly optimistic.",
    plots: [
      { file: "confusion_matrices.png", title: "Confusion matrices, domain level" },
      { file: "shap_summary.png", title: "SHAP summary, domain-level XGBoost" },
    ],
  },
};
