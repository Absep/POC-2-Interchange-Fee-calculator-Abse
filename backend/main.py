import io
import hashlib
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import pandas as pd
import numpy as np
import duckdb
from pydantic import BaseModel
from typing import Optional, List

app = FastAPI(title="Real Rails: Interchange Fee Analytics Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# ────────────────────────────────────────────────────────────
# DATA LAYER DETECTOR & CONFIGURATION
# ────────────────────────────────────────────────────────────
# Ingesting schema patterns guided by CFPB, BIS CPMI / Red Book, and ECB Data Portal
MCC_RULES = {
    5411: {"label": "Grocery Stores / Supermarkets", "base_credit": 0.0135, "base_debit": 0.0050, "flat_fee": 0.10},
    5812: {"label": "Eating Places / Restaurants", "base_credit": 0.0210, "base_debit": 0.0060, "flat_fee": 0.15},
    5732: {"label": "Electronic Stores", "base_credit": 0.0190, "base_debit": 0.0045, "flat_fee": 0.05},
    5311: {"label": "Department Stores", "base_credit": 0.0165, "base_debit": 0.0055, "flat_fee": 0.10},
    5912: {"label": "Drug Stores / Pharmacies", "base_credit": 0.0155, "base_debit": 0.0050, "flat_fee": 0.08}
}

REGIONAL_CEILINGS = {
    "US": {"credit_cap": 0.0250, "debit_cap": 0.0115, "currency": "USD"},
    "EU": {"credit_cap": 0.0030, "debit_cap": 0.0020, "currency": "EUR"}, # Reflecting strict ECB caps
    "APAC": {"credit_cap": 0.0180, "debit_cap": 0.0080, "currency": "SGD"}
}

class CalculationScenario(BaseModel):
    mcc: int
    region: str
    monthly_volume: float
    card_present_pct: float  # 0.0 to 100.0
    credit_card_pct: float    # 0.0 to 100.0

def build_synthetic_merchant_registry() -> pd.DataFrame:
    """Generates synthetic merchant ecosystem data matching required profiles."""
    np.random.seed(101)
    channels = ["Card-Present (POS)", "Card-Not-Present (eCom)", "Blended Mix"]
    regions = list(REGIONAL_CEILINGS.keys())
    mccs = list(MCC_RULES.keys())
    
    records = []
    for i in range(1, 351):
        mcc = int(np.random.choice(mccs))
        region = str(np.random.choice(regions))
        channel = str(np.random.choice(channels))
        volume = float(np.random.lognormal(mean=11.5, sigma=1.2)) # Generates realistic SMB to Mid-Market volumes
        
        # Calculate blended baseline costs using schema constants
        mcc_meta = MCC_RULES[mcc]
        credit_ratio = np.random.uniform(0.4, 0.8)
        cnp_ratio = 1.0 if channel == "Card-Not-Present (eCom)" else (0.0 if channel == "Card-Present (POS)" else 0.4)
        
        avg_rate = (credit_ratio * mcc_meta["base_credit"]) + ((1 - credit_ratio) * mcc_meta["base_debit"])
        if cnp_ratio > 0.5:
            avg_rate += 0.0035 # Risk adjustment premium for eCom rails
            
        # Apply regional regulatory ceilings (e.g. strict ECB ceilings)
        ceilings = REGIONAL_CEILINGS[region]
        avg_rate = min(avg_rate, ceilings["credit_cap"] if credit_ratio > 0.5 else ceilings["debit_cap"])
        
        total_fees = volume * avg_rate
        # Infrastructure insight conversion: Compare directly against benchmark take-rates
        regional_benchmark = 0.0175 if region == "US" else (0.0025 if region == "EU" else 0.0120)
        pct_variance = ((avg_rate - regional_benchmark) / regional_benchmark) * 100

        records.append({
            "merchant_id": f"MCH-{2000 + i}",
            "merchant_name": f"Infrastructure Entity {i}",
            "region": region,
            "currency": ceilings["currency"],
            "mcc": mcc,
            "mcc_label": mcc_meta["label"],
            "channel_mix": channel,
            "processing_volume": round(volume, 2),
            "interchange_take_rate": round(avg_rate, 4),
            "total_fees_paid": round(total_fees, 2),
            "benchmark_variance_pct": round(pct_variance, 2)
        })
    return pd.DataFrame(records)

store_df = build_synthetic_merchant_registry()

# ────────────────────────────────────────────────────────────
# API CORE ENDPOINTS
# ────────────────────────────────────────────────────────────
@app.get("/api/metrics")
def get_metrics(region: Optional[str] = None):
    """Computes global operational metrics transformed into infrastructure insights."""
    df = store_df.copy()
    if region:
        df = df[df["region"] == region]
        
    if df.empty:
        return {"total_volume": 0, "avg_take_rate": "0.00%", "merchants_counted": 0, "variance_vs_global": "0.0%"}
    
    total_vol = float(df["processing_volume"].sum())
    total_fees = float(df["total_fees_paid"].sum())
    blended_rate = total_fees / total_vol if total_vol > 0 else 0
    
    # Context-building calculations for analytics panels
    global_vol_avg = float(store_df["processing_volume"].mean())
    current_vol_avg = float(df["processing_volume"].mean())
    vol_variance = ((current_vol_avg - global_vol_avg) / global_vol_avg) * 100

    return {
        "total_volume": round(total_vol, 2),
        "avg_take_rate": f"{round(blended_rate * 100, 2)}%",
        "merchants_counted": len(df),
        "variance_vs_global": f"{'+' if vol_variance >= 0 else ''}{round(vol_variance, 1)}% vs global avg"
    }

@app.post("/api/calculate")
def calculate_scenario(scenario: CalculationScenario):
    """Performs dynamic scenario matrix analysis on user parameter mutations."""
    mcc_meta = MCC_RULES.get(scenario.mcc, {"base_credit": 0.018, "base_debit": 0.005, "flat_fee": 0.10, "label": "Custom Profile"})
    ceilings = REGIONAL_CEILINGS.get(scenario.region, {"credit_cap": 0.025, "debit_cap": 0.012, "currency": "USD"})
    
    credit_fraction = scenario.credit_card_pct / 100.0
    debit_fraction = 1.0 - credit_fraction
    cnp_fraction = (100.0 - scenario.card_present_pct) / 100.0
    
    # Calculate baseline processing trajectory
    calculated_credit = min(mcc_meta["base_credit"] + (cnp_fraction * 0.004), ceilings["credit_cap"])
    calculated_debit = min(mcc_meta["base_debit"] + (cnp_fraction * 0.002), ceilings["debit_cap"])
    
    blended_rate = (credit_fraction * calculated_credit) + (debit_fraction * calculated_debit)
    interchange_fees = scenario.monthly_volume * blended_rate
    
    # Baseline comparison matrix mapping
    baseline_benchmark = 0.0162
    optimized_rate = blended_rate * 0.88 # Estimated reduction using smart optimization configurations
    potential_savings = (blended_rate - optimized_rate) * scenario.monthly_volume

    return {
        "mcc_label": mcc_meta["label"],
        "blended_rate": round(blended_rate, 4),
        "blended_rate_pct": f"{round(blended_rate * 100, 3)}%",
        "estimated_monthly_fees": round(interchange_fees, 2),
        "variance_vs_benchmark": round(((blended_rate - baseline_benchmark) / baseline_benchmark) * 100, 2),
        "optimized_rate_pct": f"{round(optimized_rate * 100, 3)}%",
        "potential_savings": round(potential_savings, 2),
        "currency": ceilings["currency"]
    }

@app.get("/api/interchange/registry")
def query_registry(region: Optional[str] = None, mcc: Optional[int] = None):
    """Executes high-performance relational analytics filters using DuckDB pipeline."""
    query = "SELECT * FROM store_df WHERE 1=1"
    if region and region != "ALL":
        query += f" AND region = '{region}'"
    if mcc:
        query += f" AND mcc = {mcc}"
        
    res_df = duckdb.query(query).to_df()
    return res_df.replace([np.inf, -np.inf], np.nan).fillna(0).to_dict(orientation="records")

@app.get("/api/stations/csv")
def download_payment_csv():
    """Exports raw synthetic network profiles directly to CSV layout configuration."""
    csv_data = store_df.to_csv(index=False)
    return StreamingResponse(
        io.StringIO(csv_data),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=interchange_manifest_export.csv"}
    )