import math
import re
from collections import Counter
from urllib.parse import urlparse
import tldextract

_ext = tldextract.TLDExtract(suffix_list_urls=())  

KEYWORDS = ["login", "signin", "verify", "secure", "account", "update", "bank",
            "pay", "wallet", "auth", "support", "confirm", "billing", "recover", "unlock"]
BRANDS = ["paypal", "apple", "microsoft", "google", "amazon", "facebook", "netflix",
          "metamask", "instagram", "whatsapp", "coinbase", "binance", "outlook",
          "linkedin", "dropbox", "adobe", "chase", "wellsfargo"]

ABUSED_TLDS = {"xyz", "top", "tk", "ml", "ga", "cf", "gq", "icu", "buzz", "click", "live"}
SHORTENERS = {"bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly", "cutt.ly", "rb.gy"}
CONSONANTS = set("bcdfghjklmnpqrstvwxyz")
DIGITS = set("0123456789")


def entropy(s):
    if not s:
        return 0.0
    n = len(s)
    return -sum(c / n * math.log2(c / n) for c in Counter(s).values())


def longest_run(s, chars):
    best = cur = 0
    for ch in s:
        cur = cur + 1 if ch in chars else 0
        best = max(best, cur)
    return best


def get_site(url):

    url = str(url).strip()
    if "://" not in url:
        url = "http://" + url
    try:
        host = (urlparse(url).hostname or "").lower().rstrip(".")
    except ValueError:
        host = ""
    if re.fullmatch(r"\d{1,3}(\.\d{1,3}){3}", host):
        return host, host, "", True
    e = _ext(host)
    site = f"{e.domain}.{e.suffix}" if e.domain and e.suffix else host
    return site, e.domain, e.suffix, False


def extract_features(url):
    site, label, suffix, is_ip = get_site(url)
    tld = suffix.split(".")[-1] if suffix else ""
    letters = sum(c.isalpha() for c in label)
    digits = sum(c.isdigit() for c in label)
    vowels = sum(c in "aeiou" for c in label)
    return {
        "is_ip": int(is_ip),                                   # real sites rarely use raw IPs
        "label_len": len(label),                               # long names hide intent
        "site_len": len(site),
        "num_digits": digits,                                  # auto-generated names
        "digit_ratio": digits / max(len(label), 1),
        "num_hyphens": label.count("-"),                       # brand-imitation pattern
        "hyphen_parts": len(label.split("-")) if label else 0,
        "entropy": entropy(label),                             # randomness
        "vowel_ratio": vowels / max(letters, 1),               # unpronounceable names
        "max_consonant_run": longest_run(label, CONSONANTS),
        "max_digit_run": longest_run(label, DIGITS),
        "has_punycode": int("xn--" in site),                   # lookalike characters
        "num_keywords": sum(k in label for k in KEYWORDS),     # urgency/trust words
        "brand_misuse": int(any(b in label and label != b for b in BRANDS)),
        "suffix_len": len(suffix),
        "suffix_parts": suffix.count(".") + 1 if suffix else 0,
        "abused_tld": int(tld in ABUSED_TLDS),
        "is_com": int(suffix == "com"),
        "is_gov_edu": int(tld in {"gov", "edu", "mil"}),
        "is_shortener": int(site in SHORTENERS),               # hides the destination
    }


def matched_terms(url):
    _, label, _, _ = get_site(url)
    return {
        "keywords": [k for k in KEYWORDS if k in label],
        "brands": [b for b in BRANDS if b in label and label != b],
    }

