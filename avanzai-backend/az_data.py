"""
local_data_tools/universe.py

Functions to download and query instrument universes, starting with S&P 500 constituents, storing them in a SQLite database.
"""
from __future__ import annotations

import pandas as pd
import sqlite3
import os
from typing import *
import yfinance as yf
from datetime import datetime
from agents import *
from pydantic import *
from pathlib import Path
import gc
import pyarrow.parquet as pq
import numpy as np

class TickerRequest(BaseModel):
    """Request model for fetching macro data."""
    tickers: List[str]
    session_id: str

# Base Models
class QueryParams(BaseModel):
    """Base model for query parameters."""
    user_query: str


def download_sp500_universe(
    db_path: str = 'secmaster.db',
    table_name: str = 'sp500_universe',
    force: bool = False
) -> str:
    """
    Download the list of S&P 500 constituents from Wikipedia and store it in SQLite.

    Parameters:
        db_path: Path to the SQLite database file.
        table_name: Name of the table to write to.
        force: If True, re-download and overwrite even if DB exists.

    Returns:
        The path to the SQLite database containing the universe.
    """
    if os.path.exists(db_path) and not force:
        return db_path

    # Fetch S&P 500 table from Wikipedia
    url = 'https://en.wikipedia.org/wiki/List_of_S%26P_500_companies'
    tables = pd.read_html(url)
    df = tables[0]

    # Select and clean relevant columns
    df = df[[
        'Symbol',
        'Security',
        'GICS Sector',
        'GICS Sub-Industry',
        'Headquarters Location',
        'CIK'
    ]]
    df['Symbol'] = df['Symbol'].str.replace('\.', '-', regex=True)

    # Write to SQLite
    conn = sqlite3.connect(db_path)
    df.to_sql(table_name, conn, if_exists='replace', index=False)
    conn.close()

    return db_path


def query_sp500_universe(
    db_path: str = 'secmaster.db',
    table_name: str = 'sp500_universe'
) -> pd.DataFrame:
    """
    Query the stored S&P 500 universe from SQLite and return as a DataFrame.

    Parameters:
        db_path: Path to the SQLite database file.
        table_name: Name of the table to query.

    Returns:
        A pandas DataFrame of the universe.
    """
    conn = sqlite3.connect(db_path)
    df = pd.read_sql(f"SELECT * FROM {table_name}", conn)
    conn.close()
    return df

def import_csv_universe(
    csv_path: str = 'az_universe_05012025.csv',
    db_path: str = 'az_universe.db',
    table_name: str = 'az_universe',
    force: bool = False
) -> str:
    """
    Import a custom universe from a CSV file into SQLite.

    Parameters:
        csv_path: Path to the CSV file containing the universe.
        db_path: Path to the SQLite database file.
        table_name: Name of the table to write to.
        force: If True, overwrite existing table even if it exists.

    Returns:
        The path to the SQLite database containing the imported universe.
    """
    # # Check if table exists when not forcing
    # if os.path.exists(db_path) and not force:
    #     conn = sqlite3.connect(db_path)
    #     cursor = conn.cursor()
    #     cursor.execute(
    #         "SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table_name,)
    #     )
    #     exists = cursor.fetchone() is not None
    #     conn.close()
    #     if exists:
    #         return db_path

    # Read CSV into DataFrame
    df = pd.read_csv(csv_path, index_col=False)

    # Write to SQLite
    conn = sqlite3.connect(db_path)
    df.to_sql(table_name, conn, if_exists='replace', index=False)
    conn.close()

    return db_path


def query_az_universe(
    db_path: str = 'az_universe.db',
    table_name: str = 'az_universe'
) -> pd.DataFrame:
    """
    Query the imported CSV universe from SQLite and return it as a DataFrame.

    Parameters:
        db_path: Path to the SQLite database file.
        table_name: Name of the table to query.

    Returns:
        A pandas DataFrame of the imported universe.
    """
    conn = sqlite3.connect(db_path)
    df = pd.read_sql(f"SELECT * FROM {table_name}", conn, index_col=None)
    conn.close()
    return df

def download_pricing(
    csv_path: str = 'az_universe_01262025.csv',
    start: str = '2010-01-01',
    parquet_path: str = 'az_pricing_latest.parquet'
) -> str:
    """
    Download historical close prices for all tickers in a CSV universe and save to Parquet.

    Parameters:
        csv_path: Path to CSV with columns ['ticker', 'name', 'asset_class'].
        start: Start date (YYYY-MM-DD) for price download.
        parquet_path: Output Parquet file path.

    Returns:
        The path to the saved Parquet file.
    """
    # Load universe
    df = pd.read_csv(csv_path)[['ticker', 'name', 'asset_class']]
    tickers = df['ticker'].tolist()

    # Download price data
    end = datetime.now().strftime('%Y-%m-%d')
    price_data = yf.download(tickers, start=start, end=end)['Close']

    # Transform
    price_data.reset_index(inplace=True)
    price_data.rename(columns={'Date': 'date'}, inplace=True)

    # Save
    price_data.to_parquet(parquet_path, index=False)

    return parquet_path


import sqlite3
import pandas as pd
from openai import OpenAI
from typing import List, Tuple, Dict
from dataclasses import dataclass

def extract_tickers(query_result) -> List[str]:
    """
    Extract and validate tickers from a query result.
    
    Args:
        query_result: The result from sql_query_agent.query() or a string/list of tickers
        
    Returns:
        List[str]: List of cleaned ticker symbols
    """
    class ListInput(BaseModel):
        data: Union[str, List[Any], Any]

        @validator('data')
        def ensure_list_output(cls, v):
            if isinstance(v, list):
                return [item.strip() if isinstance(item, str) else item for item in v]
            if isinstance(v, str):
                if not v:
                    return []
                if v.startswith('[') and v.endswith(']'):
                    try:
                        import ast
                        return [item.strip() if isinstance(item, str) else item for item in ast.literal_eval(v)]
                    except (ValueError, SyntaxError):
                        return [item.strip() for item in v[1:-1].split(',')]
                return [item.strip() for item in v.split(',')]
            return [v]

    class ListOutput(BaseModel):
        result: List[Any]

    # Handle both agent response objects and direct string/list inputs
    if hasattr(query_result, 'response'):
        data = query_result.response
    else:
        data = query_result

    input_data = ListInput(data=data)
    return ListOutput(result=input_data.data).result


# ---------------------------------------------------------------------------
# Basic DB helpers
# ---------------------------------------------------------------------------

def _fetch_universe(db_path: str, table: str) -> pd.DataFrame:
    conn = sqlite3.connect(db_path)
    df = pd.read_sql(f"SELECT ticker, name, asset_class FROM {table}", conn)
    conn.close()
    return df


def _schema_block(db_path: str, table: str) -> str:
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute(f"PRAGMA table_info({table})")
    rows = cur.fetchall()
    conn.close()
    cols = "\n".join(f"- {name} ({ctype})" for _, name, ctype, *_ in rows)
    return f"Table: {table}\nColumns:\n{cols}"

# ---------------------------------------------------------------------------
# Example Generation & Storage
# ---------------------------------------------------------------------------

@dataclass
class GeneratedExamples:
    """Container for generated examples with metadata"""
    tool_examples: str
    outer_examples: str
    tool_schema: str
    outer_schema: str
    timestamp: str
    model: str
    db_path: str
    table: str

    def save_to_file(self, filepath: str):
        """Save examples to a file for later inspection"""
        import json
        from dataclasses import asdict
        with open(filepath, 'w') as f:
            json.dump(asdict(self), f, indent=2)
    
    @classmethod
    def load_from_file(cls, filepath: str) -> 'GeneratedExamples':
        """Load examples from a file"""
        import json
        with open(filepath, 'r') as f:
            data = json.load(f)
        return cls(**data)

    def print_examples(self):
        """Pretty print the examples for inspection"""
        print("=== TOOL EXAMPLES ===")
        print(f"Schema:\n{self.tool_schema}\n")
        print(f"Examples:\n{self.tool_examples}\n")
        print("\n=== OUTER EXAMPLES ===")
        print(f"Schema:\n{self.outer_schema}\n")
        print(f"Examples:\n{self.outer_examples}")

def generate_examples(
    db_path: str = "secmaster.db",
    table: str = "az_universe",
    tool_example_count: int = 10,
    outer_example_count: int = 10,
    model: str = "gpt-4o-mini",
) -> GeneratedExamples:
    """Generate and return both sets of examples with metadata"""
    from datetime import datetime

    # Generate tool examples
    tool_examples = generate_sql_tool_examples_ai(
        db_path=db_path,
        table=table,
        n_examples=tool_example_count,
        model=model,
    )
    print("Completed tool examples")
    
    # Generate outer examples
    outer_examples = generate_outer_examples_ai(
        db_path=db_path,
        table=table,
        n_examples=outer_example_count,
        model=model,
    )
    print("Completed outer examples")
    # Get schemas
    tool_schema = _schema_block(db_path, table)
    outer_schema = _schema_block(db_path, table)
    
    # Create examples container
    return GeneratedExamples(
        tool_examples=tool_examples,
        outer_examples=outer_examples,
        tool_schema=tool_schema,
        outer_schema=outer_schema,
        timestamp=datetime.now().isoformat(),
        model=model,
        db_path=db_path,
        table=table
    )

# ---------------------------------------------------------------------------
# 1️⃣  TOOL‑LEVEL EXAMPLES (NL → SQL)
# ---------------------------------------------------------------------------

def generate_sql_tool_examples_ai(
    db_path: str = "secmaster.db",
    table: str = "az_universe",
    n_examples: int = 25,
    model: str = "gpt-4o-2024-08-06",
):
    """Return *n_examples* NL → SQL pairs for the `get_universe_sql_query` tool."""
    df = _fetch_universe(db_path, table)
    sample_rows = df.sample(min(40, len(df)))
    sample_md = sample_rows.to_markdown(index=False)
    schema_txt = _schema_block(db_path, table)

    system_msg = (
        "You are an expert SQL engineer. Create example pairs that map a user's "
        "natural‑language request to a *SQL query* that fetches tickers from the "
        "following SQLite table. Focus on valid WHERE clauses; no joins."
    )

    user_msg = f"""
Database schema:
```
{schema_txt}
```

Here are sample rows for context:
{sample_md}

Produce **exactly {n_examples} examples**. Each example must be two lines:

User query: "<natural language>"
SQL query: <SQL>

Guidelines:
- Use different asset_class filters, name LIKE patterns, specific tickers, etc.
- Keep SQL concise: `SELECT ticker FROM {table} WHERE ...;`
- No explanatory text.
"""

    client = OpenAI()
    resp = client.chat.completions.create(
        model=model,
        temperature=0.7,
        messages=[
            {"role": "system", "content": system_msg},
            {"role": "user", "content": user_msg},
        ],
    )
    return resp.choices[0].message.content.strip()

# ---------------------------------------------------------------------------
# 2️⃣  OUTER‑AGENT EXAMPLES (NL → ticker list)
# ---------------------------------------------------------------------------

def generate_outer_examples_ai(
    db_path: str = "secmaster.db",
    table: str = "az_universe",
    n_examples: int = 25,
    model: str = "gpt-4o-2024-08-06",
):
    """Return *n_examples* NL → ticker‑list pairs for `sql_query_prompt`."""
    df = _fetch_universe(db_path, table)
    sample_rows = df.sample(min(40, len(df)))
    sample_md = sample_rows.to_markdown(index=False)
    schema_txt = _schema_block(db_path, table)

    system_msg = (
        "You are an expert financial analyst. Create example pairs mapping a "
        "user's natural‑language request to an *Output* list of tickers. Use only "
        "tickers present in the table."
    )

    user_msg = f"""
Database schema:
```
{schema_txt}
```

Here are sample rows for context:
{sample_md}

Produce **exactly {n_examples} examples**. Format:

User query: "<natural language>"
Output: ['TICK1', 'TICK2', ...]

Guidelines:
- Output must be a valid Python list of strings.
- Vary asset classes and list lengths (1‑7 tickers).
- No explanatory text.
"""

    client = OpenAI()
    resp = client.chat.completions.create(
        model=model,
        temperature=0.7,
        messages=[
            {"role": "system", "content": system_msg},
            {"role": "user", "content": user_msg},
        ],
    )
    return resp.choices[0].message.content.strip()

# ---------------------------------------------------------------------------
# 3️⃣  Agent builder – plugs everything together
# ---------------------------------------------------------------------------

from az3_api_04272025_dev import create_agent, FunctionTool, ChatMessage, get_universe_sql_query  # noqa: E401

# Base template for outer agent
_BASE_PROMPT = """You are an AI assistant specialized in generating SQL queries to extract relevant tickers from a provided universe based on user queries about financial instruments and market data. Your primary task is to analyze the user's query, generate appropriate SQL queries, and return a list of relevant tickers.

Here is the schema of the database you will be querying:

<database_schema>
{schema}
</database_schema>

Example queries:

{examples}

Instructions:

1. Carefully analyze the user's query to identify the types of tickers requested. Focus solely on extracting ticker-related information, disregarding any specific time periods mentioned.
2. Generate SQL queries to extract the relevant tickers from the az_universe table.
3. Execute the SQL queries using the get_universe_sql_query function.
4. Compile and present a list of tickers without any additional explanations.

Important Guidelines:
- If the user's query mentions multiple time periods for the same ticker type, query the ticker only once.
- Run multiple queries only if the user explicitly asks for different types of tickers (e.g., "both treasuries and tech ETFs").
- Always use the user's exact query as input for each function call.
- If you run multiple queries, concatenate the results into a single list of tickers.
- Note that '10-year', '10 year', and '10-Year' all refer to ^TNX

Remember to ONLY respond with the list of tickers. Now here's the user query:
"""

def build_sql_query_agent(
    db_path: str = "secmaster.db",
    table: str = "az_universe",
    tool_example_count: int = 25,
    outer_example_count: int = 25,
    model: str = "gpt-4o-2024-08-06",
    examples: GeneratedExamples = None,
):
    """
    Return an agent with examples either freshly generated or from provided GeneratedExamples.
    
    Args:
        db_path: Path to SQLite database
        table: Table name to query
        tool_example_count: Number of tool examples to generate if examples not provided
        outer_example_count: Number of outer examples to generate if examples not provided
        model: OpenAI model to use
        examples: Optional pre-generated examples to use instead of generating new ones
    """
    if examples is None:
        # Generate fresh examples
        examples = generate_examples(
            db_path=db_path,
            table=table,
            tool_example_count=tool_example_count,
            outer_example_count=outer_example_count,
            model=model,
        )
    
    # Build tool prompt
    tool_prompt = (
        f"You are an AI assistant that writes SQL for az_universe.\n\n"
        f"<schema>\n{examples.tool_schema}\n</schema>\n\n"
        f"<examples>\n{examples.tool_examples}\n</examples>\n\n"
        "Follow the examples. Return only the SQL query."
    )
    
    # Build outer prompt
    outer_prompt = _BASE_PROMPT.format(
        schema=examples.outer_schema,
        examples=examples.outer_examples
    )

    # Create the agent
    agent = create_agent(
        outer_prompt,
        functions_list=[get_universe_sql_query],
        default_tool_choice="get_universe_sql_query",
    )
    
    # Add run method to make agent callable
    agent.run = lambda query: agent.run(query)
    
    return agent, examples  # Return both agent and examples for inspection



class PricingRequest(BaseModel):
    """Request model for getting pricing data."""
    mode: str = Field(default="default", description="Mode of data retrieval ('default' or 'custom')")
    tickers: List[str] = Field(..., description="List of ticker symbols to fetch data for")
    user_id: Optional[str] = Field(default=None, description="User ID for custom data")
    data_id: Optional[str] = Field(default=None, description="Data ID for custom data")

def get_pricing_data_local(request: PricingRequest):
    """
    Load pricing data from a **local Parquet** file for the requested tickers.

    - `mode="default"` → reads the project-level file `az_pricing_latest.parquet`
    - `mode="custom"`  → reads `<data_dir>/<user_id>/<data_id>.parquet`

    Returns
    -------
    dict
        {"data": [ { "date": "...", "AAPL": 123.45, ... }, ... ]}
    """
    try:
        # ------------------------------------------------------------------
        # 1) Resolve the Parquet file path
        # ------------------------------------------------------------------
        DATA_DIR = Path("data")          # put custom files under ./data/…
        if request.mode == "default":
            parquet_path = Path("az_pricing_latest.parquet")
        else:
            parquet_path = DATA_DIR / str(request.user_id) / f"{request.data_id}.parquet"

        if not parquet_path.exists():
            raise FileNotFoundError(f"Pricing file not found: {parquet_path}")

        # ------------------------------------------------------------------
        # 2) Read only the columns we need
        # ------------------------------------------------------------------
        columns = ["date"] + request.tickers
        result   = []

        parquet_file = pq.ParquetFile(parquet_path)

        for rg in range(parquet_file.num_row_groups):
            try:
                df_chunk = parquet_file.read_row_group(rg, columns=columns).to_pandas()

                # Arrow returns date-typed column → keep it consistent as str
                if isinstance(df_chunk["date"].iloc[0], (pd.Timestamp, datetime)):
                    df_chunk["date"] = df_chunk["date"].dt.strftime("%Y-%m-%d")

                # Clean non-finite values so they JSON-serialize nicely
                df_chunk = df_chunk.replace([np.inf, -np.inf, np.nan], None)

                result.extend(df_chunk.to_dict(orient="records"))

                del df_chunk
                gc.collect()

            except Exception as e:
                # log & skip bad row groups instead of failing the whole request
                print(f"Row-group {rg} failed: {e}")
                continue

        if not result:
            raise ValueError(f"No records found for tickers {request.tickers}")

        return {"data": result}

    except Exception as e:
        # Let FastAPI's exception handling return 422/500 as appropriate
        raise e

    finally:
        gc.collect()
