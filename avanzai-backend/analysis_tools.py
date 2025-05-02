# analysis_tools.py  (NEW FILE)
import uuid, pandas as pd, numpy as np, datetime as dt, json, boto3, os
from typing import Dict, Any, Tuple, List, Optional, Union, Literal

import pyarrow.parquet as pq
from agents import function_tool
from pathlib import Path
from io import BytesIO
from dotenv import load_dotenv
load_dotenv()

# ------------------ in-memory hand-off store ------------------
_DF_STORE = {}
def _save(df: pd.DataFrame) -> str:
    df_id = uuid.uuid4().hex[:8]
    _DF_STORE[df_id] = df
    return df_id
def _fetch(df_id: str) -> pd.DataFrame: return _DF_STORE[df_id]

# ------------------ loader stubs (price + macro) ---------------
def load_price_s3(ticker: str) -> str:
    """Read one column from your az_pricing_*.parquet in S3, return df_id.
    
    Args:
        ticker: The ticker symbol to load
    """
    # Get environment variables with defaults
    AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
    AWS_S3_BUCKET = os.getenv('AWS_S3_BUCKET', 'avanzaidata')
    if not all([AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET]):
        raise ValueError("Missing required AWS credentials")

    s3 = boto3.client("s3",
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name="us-east-1")
    
    obj = s3.get_object(Bucket=AWS_S3_BUCKET,
                       Key="az_pricing_04112025.parquet")
    pf = pq.ParquetFile(BytesIO(obj["Body"].read()))
    df = pf.read(columns=["date", ticker]).to_pandas()
    df["date"] = pd.to_datetime(df["date"])
    df = df.set_index("date")
    df = df.rename(columns={ticker: "value"})
    return _save(df)
def get_macro_config() -> Dict[str, Any]:
    """
    Load macro configuration from JSON file when needed.
    Returns:
        Dict containing the macro indicator configuration.
    """
    try:
        config_path = Path("macro_indicators.json")
        if not config_path.exists():
            raise FileNotFoundError("Macro configuration file not found")

        with open(config_path, 'r') as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid macro configuration JSON: {str(e)}")
    except Exception as e:
        raise RuntimeError(f"Error loading macro configuration: {str(e)}")

def load_macro_fred(series: str) -> Optional[str]:
    """Load macro data from FRED after validating series exists"""
    try:
        # First validate the series exists in our macro config
        macro_json = get_macro_config()
        valid_series = [ind["ticker"] for ind in macro_json["indicators"]]
        if series not in valid_series:
            return None
            
        # Then fetch from FRED
        from fredapi import Fred
        fred = Fred('dec131e4e3ce14c271fadd2533aca3e9')
        s = fred.get_series(series)
        df = s.to_frame(name="value")
        df.index.name = "date"
        return _save(df)
    except Exception as e:
        raise ValueError(f"Error loading macro data: {str(e)}")

# ------------------ transforms --------------------------------
# analysis_tools.py  ––– replace the two transforms ––––––––––––––––––

from agents import function_tool
import pandas as pd

def _summarize_tail(df: pd.DataFrame, n: int = 5) -> list[dict]:
    """Return the last *n* rows as a list of {'date':…, 'value':…} dicts."""
    return (
        df.tail(n)
          .reset_index()
          .rename(columns={"index": "date"})
          .assign(date=lambda d: d["date"].dt.strftime("%Y-%m-%d"))
          .to_dict("records")
    )

@function_tool
def resample(
    df_id: str,
    freq: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
) -> dict:
    """
    Resample a series and return:
      {
        "df_id": "<new id>",
        "tail5": [{"date": "2025-03-31", "value": 0.0123}, …]
      }
    """
    df = _fetch(df_id)
    if start_date: df = df[df.index >= pd.to_datetime(start_date)]
    if end_date:   df = df[df.index <= pd.to_datetime(end_date)]
    out = df["value"].resample(freq).last().dropna().to_frame("value")
    new_id = _save(out)
    return {"df_id": new_id, "tail5": _summarize_tail(out)}

@function_tool
def pct_change(
    df_id: str,
    window: int,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
) -> dict:
    df = _fetch(df_id)
    if start_date: df = df[df.index >= pd.to_datetime(start_date)]
    if end_date:   df = df[df.index <= pd.to_datetime(end_date)]
    out = df["value"].pct_change(window).dropna().to_frame("value")
    new_id = _save(out)
    return {"df_id": new_id, "tail5": _summarize_tail(out)}

@function_tool
def cumulative_performance(
    df_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
) -> dict:
    """
    Rebase a price series to 100 and compounding returns forward.

    Returns a dict so the LLM sees a tiny preview:
      {
        "df_id": "<new id>",
        "tail5": [
           {"date": "2025-03-21", "value": 148.02},
           …
        ]
      }
    """
    import pandas as pd
    df = _fetch(df_id)

    # optional window filter
    if start_date:
        df = df[df.index >= pd.to_datetime(start_date)]
    if end_date:
        df = df[df.index <= pd.to_datetime(end_date)]
    if df.empty:
        raise ValueError("Date window produced empty DataFrame")

    # daily returns → cumulative index starting at 100
    daily_ret = df["value"].pct_change().fillna(0.0)
    cum = 100 * (1 + daily_ret).cumprod().to_frame("value")

    new_id = _save(cum)

    def _tail5(x: pd.DataFrame):
        return (
            x.tail(5)
             .reset_index()
             .rename(columns={"index": "date"})
             .assign(date=lambda d: d["date"].dt.strftime("%Y-%m-%d"))
             .to_dict("records")
        )

    return {"df_id": new_id, "tail5": _tail5(cum)}

# ------------------ analysis ----------------------------------
@function_tool
def correlation(x_id: str, y_id: str, start_date: Optional[str] = None, end_date: Optional[str] = None) -> str:
    x = _fetch(x_id).rename(columns={"value":"x"})
    y = _fetch(y_id).rename(columns={"value":"y"})
    df = x.join(y, how="inner")
    print(df)
    if start_date:
        df = df[df.index >= pd.to_datetime(start_date)]
    if end_date:
        df = df[df.index <= pd.to_datetime(end_date)]
        
    r = df["x"].corr(df["y"])
    return f"{r:.2%}"
