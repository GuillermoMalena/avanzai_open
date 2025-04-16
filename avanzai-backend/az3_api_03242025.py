# Standard library imports
import os
import json
import uuid
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Tuple, List, Optional, Union, Literal
import re
import asyncio
from io import BytesIO
from itertools import accumulate
from uuid import UUID
from pathlib import Path
from pydantic import BaseModel, validator
from typing import List, Any, Union
# Core web framework
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel, Field

# Database and external services
import asyncpg
from supabase import create_client, Client

# Utilities
import psutil
import requests
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import boto3
import pyarrow.parquet as pq
import numpy as np
import gc
import pandas as pd

# Import search agent components
from agents import Agent, WebSearchTool, Runner
from agents.model_settings import ModelSettings

# Load environment variables
load_dotenv()

# API Keys and Credentials
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
GROQ_API_KEY = os.getenv('GROQ_API_KEY')
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_S3_BUCKET = os.getenv('AWS_S3_BUCKET', 'avanzaidata')  # Default to 'avanzaidata' if not set
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

# Set environment variables
os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY

# Initialize Supabase client
try:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"Warning: Supabase client initialization failed: {e}")
    supabase = None

# To make all logs show up
# Initialize OpenAI client

from agents import Agent, FunctionTool, RunContextWrapper, function_tool

from fastapi import FastAPI
from pydantic import BaseModel
import pyarrow.parquet as pq
import pandas as pd
import sqlite3
import gc
import re
import numpy as np
from sqlalchemy import create_engine, inspect, text, Engine, MetaData
from sqlalchemy.exc import SQLAlchemyError
import os
from llama_index.llms.openai import OpenAI as LlamaOpenAI
from llama_index.core.tools import (BaseTool, FunctionTool, QueryEngineTool,
                                    ToolMetadata)
from llama_index.core.agent import FunctionCallingAgent
from llama_index.core.agent import (ReActAgent, StructuredPlannerAgent,
                                    FunctionCallingAgentWorker,
                                    ReActAgentWorker)
from pydantic import Field
from typing import Optional, List

from llama_index.agent.openai import OpenAIAgent
from llama_index.core.llms import ChatMessage
from typing import Dict, List
#from replit.object_storage import Client as ReplitObjectStorageClient
from io import BytesIO
import json
from datetime import datetime, timedelta, timezone
import uuid
from openai import OpenAI
from fastapi import HTTPException
#from fredapi import Fred
from typing import List, Optional, Dict, Any, Union
import io
from contextlib import asynccontextmanager

from llama_index.core.program import LLMTextCompletionProgram
# from llama_index.llms.groq import Groq
# llama3 = Groq(model="llama3-70b-8192", api_key=groq_api_key, temperature=0.0)

from llama_index.core.program import LLMTextCompletionProgram, FunctionCallingProgram
from llama_index.core.output_parsers import PydanticOutputParser
from pathlib import Path
from typing import Dict, Any
import pytz
# Load environment variables

# Database configuration - you can replace these with your own values or environment variables
DATABASE_URL = os.getenv("DATABASE_URL", "your_database_url_here")
supabase_url = os.getenv("SUPABASE_URL", "your_supabase_url_here")
supabase_key = os.getenv("SUPABASE_KEY", "your_supabase_key_here")

try:
    supabase = create_client(supabase_url, supabase_key)
except Exception as e:
    print(f"Warning: Supabase client initialization failed: {e}")
    supabase = None

from openai import OpenAI
openai_client = OpenAI()

# Helper functions for SQL agent
def create_agent(prompt, functions_list, default_tool_choice=None):
    """
    Create an agent using the provided prompt and list of functions.
    
    Args:
    - prompt (str): The system prompt for the agent.
    - functions_list (list): A list of functions to be converted into tools for the agent.
    - default_tool_choice (str, optional): The default tool choice for the agent. Default is None.

    Returns:
    - agent: The created OpenAI agent.
    """
    tools = [FunctionTool.from_defaults(fn=fn) for fn in functions_list]
    agent = OpenAIAgent.from_tools(
        tools=tools,
        prefix_messages=[ChatMessage(role="system", content=prompt)],
        verbose=True,
        default_tool_choice=default_tool_choice,
        llm=LlamaOpenAI(model="gpt-4o-2024-08-06")
    )
    return agent

def extract_tickers(query_result) -> List[str]:
    """
    Extract and validate tickers from a query result.
    
    Args:
        query_result: The result from sql_query_agent.query()
        
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

    input_data = ListInput(data=query_result.response)
    return ListOutput(result=input_data.data).result


def init_engine():
    """Initialize and cache the database engine"""
    try:
        return create_engine('sqlite:///az_universe_01262025.db')
    except Exception as e:
        print(f"Error initializing database: {e}")
        raise

class SQLQueryExtraction(BaseModel):
    sql_query: str = Field(..., description="SQL query to extract relevant tickers")


def get_universe_sql_query(query):
    """Use the user's original query here"""

    from openai import OpenAI
    from pydantic import BaseModel, Field

    # Define the examples
    EXAMPLES = """

    User query: "Create heatmap showing correlations between tech stocks [AAPL, MSFT, GOOGL, META, NVDA] and VIX for different VIX regimes (<15, 15-25, >25). Plot how these correlations evolved over 2020-2024"
    SQL query: SELECT ticker FROM az_universe WHERE ticker IN ('AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA', '^VIX');

    User query: "Plot consumer discretionary vs. consumer staples sector ETF  performance for the last 10 years"
    SQL query: SELECT ticker FROM az_universe WHERE asset_class = 'etf' AND (name LIKE '%Consumer Discretionary%' OR name LIKE '%Consumer Staples%');

    User query: "Find all crypto assets"
    SQL query: SELECT ticker FROM az_universe WHERE "asset_class" = "crypto_cross"
    User query: "what are the top equity indices"
    SQL query: SELECT ticker FROM az_universe WHERE "asset_class" = "equity_index"

    User query: "performance of the S&P500?"
    SQL query: SELECT ticker FROM az_universe WHERE "name" = "S&P 500"

    User query: "performance of NASDAQ?"
    SQL query: SELECT ticker FROM az_universe WHERE "name" = "NASDAQ Composite"

    User query: "performance of Russell 2000?"
    SQL query: SELECT ticker FROM az_universe WHERE "name" = "Russell 2000"

    User query: "How have some equity indices performed this year?"
    SQL query: SELECT ticker FROM az_universe WHERE "asset_class" = "equity_index"

    User query: "Compare performance of Bitcoin and Ethereum
    SQL query: SELECT ticker FROM az_universe WHERE name LIKE '%bitcoin%' OR name LIKE '%ethereum%';

    User query: "Compare these stocks to the tech sector"
    SQL query: SELECT ticker FROM az_universe WHERE "ticker" = "XLK"

    User query: "Compare these stocks to the utilities sector"
    SQL query: SELECT ticker FROM az_universe WHERE "ticker" = "XLU"

    User query: "How have commodities been performing"
    SQL query: SELECT ticker FROM az_universe WHERE "asset_class" = "commodity_future"

    User query: "Compare portfolio with commodity futures"
    SQL query: SELECT ticker FROM az_universe WHERE "asset_class" = "commodity_future"

    User query: "What's performance of currencies"
    SQL query: SELECT ticker FROM az_universe WHERE "asset_class" = "fx_cross"

    User query: "compare with latest performance of crypto"
    SQL query: SELECT ticker FROM az_universe WHERE "asset_class" = "crypto_cross"

    User query: "what's the performance of Pfizer today?"
    SQL query: SELECT ticker FROM az_universe WHERE name LIKE '%Pfizer%'

    User query: "what's the performance of UnitedHealth and Pfizer today?"
    SQL query: WHERE name LIKE '%UnitedHealth%' OR name LIKE '%United Health%' OR name LIKE '%Pfizer%'

    User query: "Show me all factor ETFs in the universe."
    SQL query: SELECT ticker FROM az_universe WHERE name LIKE '%factor%';

    User query: "What value ETFs are available?"
    SQL query: SELECT ticker FROM az_universe WHERE name LIKE '%value%';

    User query: "List all growth-focused ETFs."
    SQL query: SELECT ticker FROM az_universe WHERE name LIKE '%growth%';

    User query: "Can you show me the mid-cap ETFs?"
    SQL query: SELECT ticker FROM az_universe WHERE name LIKE '%mid%cap%' OR name LIKE '%midcap%';

    User query: "What large-cap ETFs do we have in the universe?"
    SQL query: SELECT ticker FROM az_universe WHERE name LIKE '%large%cap%' OR name LIKE '%largecap%';

    User query: "I'm interested in dividend stocks. What options are there?"
    SQL query: SELECT ticker FROM az_universe WHERE name LIKE '%dividend%';

    User query: "Show me ETFs that focus on quality stocks."
    SQL query: SELECT ticker FROM az_universe WHERE name LIKE '%quality%';

    User query: "What small cap stocks are available?"
    SQL query: SELECT ticker FROM az_universe WHERE name LIKE '%small%cap%' OR name LIKE '%smallcap%';

    User query: "Can you list the small-cap ETFs in the universe?"
    SQL query: SELECT ticker FROM az_universe WHERE name LIKE '%small%cap%' OR name LIKE '%smallcap%';

    User query: "Show me ETFs related to technology and healthcare sectors."
    SQL query: SELECT ticker FROM az_universe WHERE (name LIKE '%technology%' OR name LIKE '%tech%' OR name LIKE '%healthcare%' OR name LIKE '%health%care%') AND asset_class = 'etf';

    User query: "Compare returns for the utilities and technology sectors"
    SQL query: SELECT ticker FROM az_universe WHERE (name LIKE '%healthcare%' OR name LIKE '%health%care%' OR name LIKE '%utilities%') AND asset_class = 'etf';

    User query: "Show me performance of treasury rates for the last month?"
    SQL query: SELECT ticker FROM az_universe WHERE name LIKE '%treasury%';

    User query: "What's the trend in treasury rates over the past 30 days?"
    SQL query: SELECT ticker FROM az_universe WHERE name LIKE '%treasury%';

    User query: "Show correlation between XLE and XLU during oil price spikes"
    SQL query: SELECT ticker FROM az_universe WHERE (ticker LIKE '%XLE%' OR ticker LIKE '%XLU%') AND ticker LIKE '%CL=F%';

    User query: "Show sector correlations during periods of high inflation"
    SQL query: SELECT ticker FROM az_universe WHERE name LIKE '%SPDR%' AND asset_class = 'spx_sector';

    User query: "plot sector returns for the past 6 months"
    SQL query: SELECT ticker FROM az_universe WHERE asset_class = 'spx_sector';

    User query: "What's the relationship between crude oil prices and the S&P 500?"
    SQL query: SELECT ticker FROM az_universe WHERE name LIKE '%oil%' OR ticker = 'CL=F';

    User query: "Compare 10-year treasury yield with inflation rates"
    SQL query: SELECT ticker FROM az_universe WHERE name LIKE '%10-Year%' AND asset_class = 'sovereign debt';

    User query: "Plot crude oil volatility against 10-year treasury yields"
    SQL query: SELECT ticker FROM az_universe WHERE name LIKE '%oil%' OR name LIKE '%10-Year%';

    User query: "Compare Dollar Index movement with treasury yields during Fed meetings"
    SQL query: SELECT ticker FROM az_universe WHERE ticker = 'DX-Y.NYB' OR name LIKE '%10-Year%';

    User query: "Analyze dollar trends during rising treasury yields"
    SQL query: SELECT ticker FROM az_universe WHERE ticker = 'DX-Y.NYB' OR name LIKE '%10-Year%';

    User query: "Which Consumer Staples stocks have the highest negative correlation with 10 year treasury bonds?"
    SQL query: SELECT ticker FROM az_universe WHERE name LIKE '%10-Year%';

    User query: "What's the relationship between 10 year treasury yields and gold prices?"
    SQL query: SELECT ticker FROM az_universe WHERE name LIKE '%10-Year%' OR name LIKE '%gold%';

    User query: "How does the US Dollar Index affect emerging market currencies?"
    SQL query: SELECT ticker FROM az_universe WHERE ticker = 'DX-Y.NYB' OR name LIKE '%emerging%market%' OR name LIKE '%emerging%markets%';

    User query: "Which Financial sector stocks show highest sensitivity to US dollar movements?"
    SQL query: SELECT ticker FROM az_universe WHERE name LIKE '%dollar%';

    User query: "plot cumulative returns of developed and emerging market ETFs for the last year"
    SQL query: SELECT ticker FROM az_universe WHERE name LIKE '%developed%market%' OR name LIKE '%emerging%market%';

    User query: "Compare performance between developed and emerging market ETFs"
    SQL query: SELECT ticker FROM az_universe WHERE name LIKE '%developed%market%' OR name LIKE '%emerging%market%';

    """

    # Define the schema
    SCHEMA = """
    Table: az_universe
    Columns:
    - ticker (TEXT): The unique identifier for the asset
    - name (TEXT): The full name or description of the asset
    - asset_class (TEXT): The classification of the asset (e.g., equity, etf, crypto, fx_cross, commodity_future,equity_index)
    """

    class SQLQueryExtraction(BaseModel):
        sql_query: str = Field(
            ..., description="SQL query to extract relevant tickers")

    system = f"""You are an AI assistant specialized in generating SQL queries for financial data analysis, covering a wide range of financial instruments including equities, commodities, equity indices, FX rates, and cryptocurrencies. Your primary task is to interpret user requests and generate appropriate SQL queries to extract financial market data from a database.

First, let's review the database schema you'll be working with:

<schema>
{SCHEMA}
</schema>

To guide your query generation, here are some example queries that demonstrate proper usage of the schema and handling of various financial instruments:

<examples>
{EXAMPLES}
</examples>

When generating SQL queries, please adhere to the following guidelines:

1. Use only the tables and columns specified in the provided schema.
2. Note that '10-year', '10 year', and '10-Year' all refer to ^TNX
3. If you ever querying for a ticker or name, use wildcard to match the ticker or name in the query (i.e %VIX%)
3. Return all tickers without filtering or ranking, unless explicitly requested by the user.
4. Do not attempt to filter for data that may not exist in the database (e.g., specific election dates).
5. Focus on retrieving raw data, allowing the user to perform transformations or analysis later.
6. Ensure your query is syntactically correct and optimized for performance.

When you receive a user request, follow these steps:

1. Wrap your query planning process in <query_planning> tags. Include the following steps:
   a. Break down the key components of the user's request.
   b. Identify the relevant data points required to fulfill the request.
   c. List the specific tables and columns needed for the query.
   d. Consider any necessary JOINs or subqueries.
   e. Outline the general structure of the SQL query (SELECT, FROM, WHERE, etc.).

2. Based on your query planning, construct a SQL query that retrieves the necessary data.
3. Review your query to ensure it meets all the guidelines mentioned above.
4. Output only the final SQL query, without any additional explanation.

Here's an example of how to structure your response:

<query_planning>
[Your detailed query planning process goes here]
</query_planning>

[SQL query goes here, without any tags]

Now, please wait for a user request to generate a SQL query."""

    messages = [{
        "role": "system",
        "content": system
    }, {
        "role": "user",
        "content": [{
            "type": "text",
            "text": query
        }]
    }, {
        "role": "assistant",
        "content": [{
            "type": "text",
            "text": "<query_planning>"
        }]
    }]

    # OpenAI API call to generate SQL query
    extraction = openai_client.beta.chat.completions.parse(
        model="gpt-4o-2024-08-06",
        response_format=SQLQueryExtraction,
        messages=messages,
    )

    sql_query = extraction.choices[0].message.parsed.sql_query
    # Execute the SQL query and return the list of tickers
    engine = init_engine()
    try:
        with engine.connect() as connection:
            tickers = pd.DataFrame(connection.execute(
                text(sql_query)))['ticker'].to_list()
        return tickers
    finally:
        engine.dispose()


# SQL Query Agent Setup
functions_list = [get_universe_sql_query]

sql_query_prompt = """
You are an AI assistant specialized in generating SQL queries to extract relevant tickers from a provided universe based on user queries about financial instruments and market data. Your primary task is to analyze the user's query, generate appropriate SQL queries, and return a list of relevant tickers.

Here is the schema of the database you will be querying:

<database_schema>
Table: az_universe
Columns:
- ticker (TEXT): The unique identifier for the asset
- name (TEXT): The full name or description of the asset
- asset_class (TEXT): The classification of the asset (e.g., equity, etf, crypto, fx_cross, commodity_future,equity_index)
</database_schema>

Example queries:

User query: "Create heatmap showing correlations between tech stocks [AAPL, MSFT, GOOGL, META, NVDA] and VIX for different VIX regimes (<15, 15-25, >25). Plot how these correlations evolved over 2020-2024"
Output: ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA', '^VIX']

User query: "Plot consumer discretionary vs. consumer staples sector ETF performance for the last 10 years"
Output: ['XLY', 'XLP']

User query: "Find all crypto assets"
Output: ['BTC-USD', 'ETH-USD', 'SOL-USD', 'ADA-USD', 'XRP-USD']

User query: "what are the top equity indices"
Output: ['^GSPC', '^IXIC', '^RUT', '^DJI']

User query: "performance of the S&P500?"
Output: ['^GSPC']

User query: "performance of NASDAQ?"
Output: ['^IXIC']

User query: "performance of Russell 2000?"
Output: ['^RUT']

User query: "How have some equity indices performed this year?"
Output: ['^GSPC', '^IXIC', '^RUT', '^DJI']

User query: "Compare performance of Bitcoin and Ethereum"
Output: ['BTC-USD', 'ETH-USD']

User query: "Create correlation heatmap between crude oil, gold, and 10-year Treasury yield during high inflation periods"
Output: ['CL=F', 'GC=F', '^TNX']

User query: "Plot crude oil volatility impact on energy sector ETF during rate hike cycles"
Output: ['CL=F', 'XLE', '^TNX']

User query: "Compare 10 year Treasury yield movements during different Fed policy regimes"
Output: ['^TNX', 'DX-Y.NYB']

User query: "Analyze relationship between USD Dollar Index and emerging markets during Fed hiking cycles"
Output: ['DX-Y.NYB', 'EEM']

User query: "Create scatter plot of Dollar Index vs Gold prices during market stress periods"
Output: ['DX-Y.NYB', 'GC=F', '^VIX']

User query: "Show correlation between Dollar Index strength and crude oil prices since 2020"
Output: ['DX-Y.NYB', 'CL=F']

User query: "Compare performance of major stock indices and 10-year Treasury yield"
Output: ['^GSPC', '^IXIC', '^RUT', '^DJI', '^TNX']

User query: "Which Financial sector stocks show highest sensitivity to US dollar movements?"
Output: ['JNJ', 'UNH', 'LLY', 'PFE', 'MRK','DX-Y.NYB']

Instructions:

1. Carefully analyze the user's query to identify the types of tickers requested. Focus solely on extracting ticker-related information, disregarding any specific time periods mentioned.
2. Generate SQL queries to extract the relevant tickers from the az_universe table.
3. Execute the SQL queries using the get_universe_sql_query function.
4. Compile and present a list of tickers without any additional explanations.

Important Guidelines:
- If the user's query mentions multiple time periods for the same ticker type, query
the ticker only once.
- Run multiple queries only if the user explicitly asks for different types of 
tickers (e.g., "both treasuries and tech ETFs").
- Always use the user's exact query as input for each function call.
- If you run multiple queries, concatenate the results into a single list of 
tickers.
- Note that '10-year', '10 year', and '10-Year' all refer to ^TNX

Remember to ONLY respond with the list of tickers. Now here's the user query:

"""

# Create the agent using the create_agent function
sql_query_agent = create_agent(sql_query_prompt,
                               functions_list,
                               default_tool_choice="get_universe_sql_query")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for FastAPI application."""
    # Import any heavy modules here to optimize startup time
    try:
        import yfinance as yf
        app.state.yfinance = yf
    except ImportError:
        print("Warning: yfinance not installed. Stock data functionality will be limited.")
        app.state.yfinance = None
    
    # Ensure sessions directory exists
    Path("sessions").mkdir(parents=True, exist_ok=True)
    
    # Initialize any other components
    print("Server initializing...")
    
    yield  # Server is running
    
    # Cleanup (if needed)
    print("Server shutting down...")


app = FastAPI(lifespan=lifespan)

# Initialize CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)


# Lightweight health check endpoints
@app.get("/")
async def root():
    return {"status": "online"}


@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


# Base Models
class QueryParams(BaseModel):
    """Base model for query parameters."""
    user_query: str

class TickerList(BaseModel):
    """Model for list of tickers."""
    tickers: List[str]

class PricingRequest(BaseModel):
    """Request model for getting pricing data."""
    mode: str = Field(default="default", description="Mode of data retrieval ('default' or 'custom')")
    tickers: List[str] = Field(..., description="List of ticker symbols to fetch data for")
    user_id: Optional[str] = Field(default=None, description="User ID for custom data")
    data_id: Optional[str] = Field(default=None, description="Data ID for custom data")

class DataRequest(BaseModel):
    """Request model for data operations."""
    tickers: List[str]
    data_type: str
    query_prompt: Optional[str] = None
    fields: Optional[List[str]] = None
    user_id: Optional[str] = None
    data_id: Optional[str] = None
    mode: Optional[str] = "default"

class DataResponse(BaseModel):
    """Response model for data operations."""
    session_id: str
    data_type: str
    message: str
    path: Optional[str] = None  # Add path field for file location

class SessionResponse(BaseModel):
    """Response model for session operations."""
    session_id: str
    expires_at: str

async def get_pricing_data(request: PricingRequest) -> List[Dict]:
    """
    Get pricing data from S3 for the requested tickers.
    Data is in column format where each ticker is a column header.
    """
    try:
        print(f"Fetching pricing data for tickers: {request.tickers}")
        access_key = os.getenv('AWS_ACCESS_KEY')
        secret_key = os.getenv('AWS_SECRET_KEY')
        s3_client = boto3.client('s3',
                                region_name='us-east-1',
                                aws_access_key_id=access_key,
                                aws_secret_access_key=secret_key)
        bucket_name = 'avanzaidata'
        
        # Determine file path based on mode
        if request.mode == 'default':
            file_path = 'az_pricing_latest.parquet'
        else:
            file_path = f'users/{request.user_id}/{request.data_id}.parquet'

        print(f"Fetching data from S3: {file_path}")
        
        try:
            # Get the parquet file metadata first
            response = s3_client.get_object(Bucket=bucket_name, Key=file_path)
        except Exception as e:
            print(f"Error fetching from S3: {str(e)}")
            raise ValueError(f"Failed to fetch data from S3: {str(e)}")

        # Create a ParquetFile object to enable reading in pieces
        parquet_file = pq.ParquetFile(BytesIO(response['Body'].read()))

        # Read only the columns we need
        columns = ['date'] + request.tickers
        print(f"Reading columns: {columns}")

        # Process in chunks
        result = []
        for batch in range(parquet_file.num_row_groups):
            try:
                # Read one row group at a time
                df_chunk = parquet_file.read_row_group(batch, columns=columns).to_pandas()
                
                # Convert timestamps to string format if needed
                if isinstance(df_chunk['date'].iloc[0], (pd.Timestamp, datetime)):
                    df_chunk['date'] = df_chunk['date'].dt.strftime('%Y-%m-%d')
                
                # Replace invalid values
                df_chunk = df_chunk.replace([np.inf, -np.inf, np.nan], None)
                
                # Convert to records
                records = df_chunk.to_dict(orient='records')
                result.extend(records)

                # Clear chunk from memory
                del df_chunk
                gc.collect()
            except Exception as e:
                print(f"Error processing batch {batch}: {str(e)}")
                continue

        print(f"Total records fetched: {len(result)}")
        if result:
            print(f"Sample record: {result[0]}")
        else:
            raise ValueError(f"No valid records found for tickers: {request.tickers}")

        return result

    except Exception as e:
        print(f"Error in get_pricing_data: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise ValueError(f"Failed to load pricing data: {str(e)}")
    finally:
        gc.collect()

class SessionManager:
    """Manage file sessions and maintain session summaries."""

    def __init__(self, base_path="./sessions"):
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

    async def initialize_session(self, session_id: UUID) -> Path:
        """Initialize or get existing session folder."""
        session_path = self.base_path / str(session_id)
        
        if not session_path.exists():
            session_path.mkdir(parents=True, exist_ok=True)
            # Initialize empty session summary
            await self.update_session_summary(session_id)
        
        return session_path

    async def update_session_summary(
        self, 
        session_id: UUID, 
        ticker: str = None,
        operation_type: str = None,
        metrics: List[str] = None,
        time_range: str = None
    ) -> Dict:
        """Update session summary with new information."""
        summary_path = self.base_path / str(session_id) / "session_summary.json"
        
        # Load existing summary or create new
        if summary_path.exists():
            with open(summary_path, 'r') as f:
                summary = json.load(f)
        else:
            summary = {
                "session_id": str(session_id),
                "created_at": datetime.now(timezone.utc).isoformat(),
                "last_updated": datetime.now(timezone.utc).isoformat(),
                "data_holdings": {"pricing_data": {"tickers": {}, "total_tickers": 0}},
                "storage": {"total_files": 0, "total_size_bytes": 0, "last_cleanup": None},
                "statistics": {"total_requests": 0, "requests_by_type": {}, "data_points_processed": 0}
            }
        
        # Update summary based on operation
        if ticker and operation_type == "process_financial_data":
            # Update ticker information
            ticker_info = summary["data_holdings"]["pricing_data"]["tickers"].get(ticker, {
                "added_at": datetime.now(timezone.utc).isoformat(),
                "processed_files": []
            })
            
            if metrics:
                ticker_info["metrics"] = list(set(ticker_info.get("metrics", []) + metrics))
            
            if time_range:
                ticker_info["time_range"] = {
                    "start": (datetime.now() - self._get_timedelta(time_range)).strftime("%Y-%m-%d"),
                    "end": datetime.now().strftime("%Y-%m-%d")
                }
            
            # Add processed file info
            filename = f"{ticker}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            ticker_info["processed_files"].append({
                "filename": filename,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "metrics_processed": metrics,
                "time_range_processed": time_range
            })
            
            summary["data_holdings"]["pricing_data"]["tickers"][ticker] = ticker_info
            summary["data_holdings"]["pricing_data"]["total_tickers"] = len(
                summary["data_holdings"]["pricing_data"]["tickers"]
            )
        
        # Update general statistics
        summary["last_updated"] = datetime.now(timezone.utc).isoformat()
        if operation_type:
            summary["statistics"]["total_requests"] += 1
            summary["statistics"]["requests_by_type"][operation_type] = (
                summary["statistics"]["requests_by_type"].get(operation_type, 0) + 1
            )
        
        # Update storage information
        session_path = self.base_path / str(session_id)
        total_size = sum(f.stat().st_size for f in session_path.rglob('*') if f.is_file())
        total_files = sum(1 for _ in session_path.rglob('*') if _.is_file())
        summary["storage"].update({
            "total_files": total_files,
            "total_size_bytes": total_size
        })
        
        # Save updated summary
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=2)
        
        return summary

    async def get_session_summary(self, session_id: UUID) -> Dict:
        """Get the current session summary."""
        summary_path = self.base_path / str(session_id) / "session_summary.json"
        if not summary_path.exists():
            raise FileNotFoundError(f"No summary found for session {session_id}")
        
        with open(summary_path, 'r') as f:
            return json.load(f)

    async def get_or_update_pricing_data(self, session_id: UUID, ticker: str) -> Dict:
        """Get pricing data for ticker, updating session data if needed."""
        try:
            session_path = self.base_path / str(session_id)
            pricing_data_path = session_path / "pricing_data.json"
            
            # Load existing data if available
            existing_data = {}
            if pricing_data_path.exists():
                with open(pricing_data_path, 'r') as f:
                    existing_data = json.load(f)
            
            # Check if we already have data for this ticker
            if ticker not in existing_data.get('tickers', []):
                print(f"Fetching new data for ticker: {ticker}")
                
                # Get pricing data using get_pricing_data2
                pricing_response = await get_pricing_data2(
                    PricingRequest(mode='default', tickers=[ticker])
                )
                
                if not pricing_response or 'data' not in pricing_response:
                    raise ValueError(f"Failed to fetch data for ticker {ticker}")
                
                new_data = pricing_response['data']
                
                # Merge with existing data
                if existing_data and 'data' in existing_data:
                    print(f"Merging new data with existing data for {ticker}")
                    existing_data['tickers'].append(ticker)
                    for day in new_data:
                        matching_day = next((d for d in existing_data['data'] if d['date'] == day['date']), None)
                        if matching_day:
                            matching_day.update({k: v for k, v in day.items() if k != 'date'})
                        else:
                            existing_data['data'].append(day)
                else:
                    print(f"Creating new data structure for {ticker}")
                    existing_data = {
                        'tickers': [ticker],
                        'data': new_data
                    }
                
                # Save updated data
                with open(pricing_data_path, 'w') as f:
                    json.dump(existing_data, f)
                
                print(f"Updated session data saved for {ticker}")
            else:
                print(f"Using cached data for {ticker}")
            
            if not existing_data.get('data'):
                raise ValueError(f"No data available for ticker {ticker}")
            
            return existing_data
            
        except Exception as e:
            print(f"Error in get_or_update_pricing_data: {str(e)}")
            print(f"Error type: {type(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            raise ValueError(f"Failed to get or update pricing data: {str(e)}")

    def save_dataframe(self, df: pd.DataFrame, session_id: str, data_type: str) -> bool:
        """Save DataFrame to parquet file in session directory."""
        try:
            # Create session directory if it doesn't exist
            session_path = self.base_path / str(session_id)
            session_path.mkdir(parents=True, exist_ok=True)
            
            # Save DataFrame as parquet
            filepath = session_path / f"{data_type}.parquet"
            df.to_parquet(filepath)
            
            # Update session metadata
            metadata = self.load_session_metadata(session_id) or {}
            metadata.update({
                "last_updated": datetime.now(timezone.utc).isoformat(),
                f"{data_type}_saved": True,
                f"{data_type}_path": str(filepath)
            })
            self.save_session_metadata(session_id, metadata)
            
            return True
        except Exception as e:
            print(f"Error saving dataframe: {str(e)}")
            return False

    def load_dataframe(self, session_id: str, data_type: str) -> Optional[pd.DataFrame]:
        """Load DataFrame from parquet file in session directory."""
        try:
            filepath = self.base_path / str(session_id) / f"{data_type}.parquet"
            if filepath.exists():
                return pd.read_parquet(filepath)
            return None
        except Exception as e:
            print(f"Error loading dataframe: {str(e)}")
            return None

    def save_session_metadata(self, session_id: str, metadata: dict) -> bool:
        """Save session metadata to JSON file."""
        try:
            session_path = self.base_path / str(session_id)
            session_path.mkdir(parents=True, exist_ok=True)
            
            metadata_path = session_path / "metadata.json"
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, default=self._datetime_handler)
            return True
        except Exception as e:
            print(f"Error saving metadata: {str(e)}")
            return False

    def load_session_metadata(self, session_id: str) -> Optional[dict]:
        """Load session metadata from JSON file."""
        try:
            metadata_path = self.base_path / str(session_id) / "metadata.json"
            if not metadata_path.exists():
                return None
            with open(metadata_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading metadata: {str(e)}")
            return None

    def update_session_metadata(self, session_id: str, updates: dict) -> bool:
        """Update existing session metadata with new values."""
        try:
            metadata = self.load_session_metadata(session_id) or {}
            metadata.update(updates)
            metadata["last_updated"] = datetime.now(timezone.utc).isoformat()
            return self.save_session_metadata(session_id, metadata)
        except Exception as e:
            print(f"Error updating metadata: {str(e)}")
            return False

    def delete_session(self, session_id: str) -> bool:
        """Delete all session data and metadata."""
        try:
            session_path = self.base_path / str(session_id)
            if session_path.exists():
                import shutil
                shutil.rmtree(session_path)
            return True
        except Exception as e:
            print(f"Error deleting session: {str(e)}")
            return False

    @staticmethod
    def _datetime_handler(obj):
        """Handle datetime serialization for JSON."""
        if isinstance(obj, (datetime, timedelta)):
            return obj.isoformat()
        raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

    @staticmethod
    def _get_timedelta(time_range: str) -> timedelta:
        """Convert time range string to timedelta."""
        mapping = {
            "1d": timedelta(days=1),
            "1w": timedelta(weeks=1),
            "1m": timedelta(days=30),
            "3m": timedelta(days=90),
            "6m": timedelta(days=180),
            "1y": timedelta(days=365),
            "5y": timedelta(days=365*5)
        }
        return mapping.get(time_range, timedelta(days=365))  # Default to 1y

# Initialize session manager globally
session_manager = SessionManager()


def extract_ticker_symbol(user_query: str) -> Optional[str]:
    """
    Extract ticker symbol from user query.
    
    Args:
        user_query: Natural language query from the user
    
    Returns:
        Ticker symbol if found, None otherwise
    """
    # Common stock tickers to look for
    common_tickers = ["AAPL", "MSFT", "GOOGL", "GOOG", "AMZN", "META", "TSLA", "NVDA", "JPM", "V"]
    
    # Split query into parts and check each part
    query_parts = user_query.upper().split()
    
    # Check each part against common tickers
    for part in query_parts:
        # Remove any special characters
        cleaned_part = re.sub(r'[^A-Z]', '', part)
        if cleaned_part in common_tickers:
            return cleaned_part
            
    # If no match found in common tickers, check company names
    company_to_ticker = {
        "APPLE": "AAPL",
        "MICROSOFT": "MSFT", 
        "GOOGLE": "GOOGL",
        "AMAZON": "AMZN",
        "FACEBOOK": "META",
        "META": "META",
        "TESLA": "TSLA",
        "NVIDIA": "NVDA",
        "JPMORGAN": "JPM",
        "VISA": "V"
    }
    
    for part in query_parts:
        if part in company_to_ticker:
            return company_to_ticker[part]
    
    return None


async def get_latest_pricing_data(user_id: str) -> Tuple[List[Dict], Path]:
    """
    Get the stored pricing data.
    
    Returns:
        Tuple containing the pricing data and the path to the data file
    """
    try:
        data_path = Path("data") / "pricing_data.json"
        with open(data_path, 'r') as f:
            pricing_data = json.load(f)
        return pricing_data["data"], data_path
        
    except Exception as e:
        raise HTTPException(status_code=500,
                          detail=f"Failed to load pricing data: {str(e)}")

def calculate_returns_metrics(price_data: List[Dict], ticker: str, start_date: str = None, end_date: str = None) -> Dict[str, Any]:
    """Calculate returns metrics from column-based price data."""
    # Debug print
    print(f"Calculating returns for {ticker}")
    print(f"Date range: {start_date} to {end_date}")
    print(f"First few records before filtering: {price_data[:2]}")
    
    # First convert all dates to datetime for proper comparison
    prices_data = []
    for day in price_data:
        if day.get(ticker) is not None and str(day[ticker]).strip() and float(day[ticker]) > 0:
            try:
                date_str = day['date']
                # Convert to datetime for comparison
                date_obj = datetime.strptime(date_str, '%Y-%m-%d')
                prices_data.append({
                    'date': date_str,
                    'price': float(day[ticker])
                })
            except (ValueError, TypeError) as e:
                print(f"Error processing date {day.get('date')}: {e}")
                continue
    
    print(f"Valid price records before date filtering: {len(prices_data)}")
    if prices_data:
        print(f"Date range in data: {prices_data[0]['date']} to {prices_data[-1]['date']}")
    
    # Filter by date range if specified
    if start_date or end_date:
        start_dt = datetime.strptime(start_date, '%Y-%m-%d') if start_date else None
        end_dt = datetime.strptime(end_date, '%Y-%m-%d') if end_date else None
        
        filtered_data = []
        for record in prices_data:
            record_dt = datetime.strptime(record['date'], '%Y-%m-%d')
            if start_dt and record_dt < start_dt:
                continue
            if end_dt and record_dt > end_dt:
                continue
            filtered_data.append(record)
        prices_data = filtered_data
    
    print(f"Records after date filtering: {len(prices_data)}")
    if prices_data:
        print(f"First record after filtering: {prices_data[0]}")
        print(f"Last record after filtering: {prices_data[-1]}")

    if len(prices_data) < 2:
        print(f"Insufficient data after filtering. Records: {len(prices_data)}")
        raise ValueError("Insufficient data after filtering.")

    # Sort by date to ensure proper order
    prices_data.sort(key=lambda x: x['date'])
    
    dates = [d['date'] for d in prices_data]
    prices = [d['price'] for d in prices_data]

    # Calculate returns
    daily_returns = [prices[i] / prices[i - 1] - 1 for i in range(1, len(prices))]
    cum_returns = list(accumulate(daily_returns, lambda acc, r: acc * (1 + r), initial=1.0))
    cum_returns = [r - 1 for r in cum_returns]

    cumulative_series = [{'date': date, 'value': ret} for date, ret in zip(dates, cum_returns)]

    return {
        "ticker": ticker,
        "period_start": dates[0],
        "period_end": dates[-1],
        "cumulative_performance": float(cum_returns[-1]),
        "cumulative_series": cumulative_series,
        "cumulative_series_length": len(cumulative_series),
        "calculated_at": datetime.now().isoformat()
    }

async def calculate_stock_performance(ticker: str, user_id: str, start_date: str = None, end_date: str = None) -> Dict[str, Any]:
    """
    Calculate performance metrics for a given stock ticker using actual pricing data.
    
    Args:
        ticker: Stock ticker symbol
        user_id: User ID to locate their pricing data
        start_date: Optional start date in ISO format (YYYY-MM-DD)
        end_date: Optional end date in ISO format (YYYY-MM-DD)
        
    Returns:
        Dictionary containing performance metrics
    """
    try:
        # Get the latest pricing data
        price_data, _ = await get_latest_pricing_data(user_id)
        
        # Calculate performance metrics
        performance = calculate_returns_metrics(price_data, ticker, start_date, end_date)
        
        return performance
        
    except Exception as e:
        raise HTTPException(status_code=500,
                          detail=f"Failed to calculate stock performance: {str(e)}")


class StockCalcRequest(BaseModel):
    user_query: str


def upload_to_s3(data: Dict, user_id: str, filename: str) -> str:
    """
    Upload data to a user-specific folder in S3.
    
    Args:
        data: Data to upload
        user_id: User ID for folder path
        filename: Name of the file
        
    Returns:
        S3 key of uploaded file
    """
    # Initialize S3 client with environment variables
    s3_client = boto3.client('s3',
                            region_name='us-east-1',
                            aws_access_key_id=AWS_ACCESS_KEY_ID,
                            aws_secret_access_key=AWS_SECRET_ACCESS_KEY)
    
    # Create S3 key with user-specific folder
    s3_key = f"users/{user_id}/data/{filename}"
    
    # Upload to S3
    s3_client.put_object(
        Bucket=AWS_S3_BUCKET,
        Key=s3_key,
        Body=json.dumps(data)
    )
    
    return s3_key

def get_presigned_url(s3_key: str, expiration: int = 3600) -> str:
    """
    Generate a presigned URL for an S3 object.
    
    Args:
        s3_key: S3 key of the object
        expiration: URL expiration time in seconds (default: 1 hour)
        
    Returns:
        Presigned URL
    """
    # Initialize S3 client with environment variables
    s3_client = boto3.client('s3',
                            region_name='us-east-1',
                            aws_access_key_id=AWS_ACCESS_KEY_ID,
                            aws_secret_access_key=AWS_SECRET_ACCESS_KEY)
    
    # Generate presigned URL
    url = s3_client.generate_presigned_url(
        'get_object',
        Params={
            'Bucket': AWS_S3_BUCKET,
            'Key': s3_key
        },
        ExpiresIn=expiration
    )
    
    return url

@app.post("/get_tickers")
async def get_tickers(params: QueryParams):
    """Get tickers based on user query using SQL."""
    response = sql_query_agent.query(params.user_query)
    print(f"SQL QueryResponse: {response}")
    tickers = extract_tickers(response)
    return {"tickers": tickers}

@app.post("/get_pricing_data")
async def get_pricing_data(request: PricingRequest):
    """
    Retrieve pricing data from S3, store it, and return a presigned URL.
    
    Args:
        request: PricingRequest containing list of tickers
    
    Returns:
        Dictionary containing status and presigned URL for the data
    """
    try:
        # Create data directory if it doesn't exist
        data_dir = Path("data")
        data_dir.mkdir(exist_ok=True)
        
        # Initialize S3 client with environment variables
        s3_client = boto3.client('s3',
                                region_name='us-east-1',
                                aws_access_key_id=AWS_ACCESS_KEY_ID,
                                aws_secret_access_key=AWS_SECRET_ACCESS_KEY)
        
        bucket_name = 'avanzaidata'
        
        # Determine file path based on mode
        if request.mode == 'default':
            file_path = 'az_pricing_latest.parquet'
        else:
            file_path = f'users/{request.user_id}/{request.data_id}.parquet'

        print(f"Fetching data from S3: {file_path}")
        
        try:
            # Get the parquet file metadata first
            response = s3_client.get_object(Bucket=bucket_name, Key=file_path)
        except Exception as e:
            print(f"Error fetching from S3: {str(e)}")
            raise ValueError(f"Failed to fetch data from S3: {str(e)}")

        # Create a ParquetFile object to enable reading in pieces
        parquet_file = pq.ParquetFile(BytesIO(response['Body'].read()))

        # Read only the columns we need
        columns = ['date'] + request.tickers
        print(f"Reading columns: {columns}")

        # Process in chunks
        result = []
        for batch in range(parquet_file.num_row_groups):
            try:
                # Read one row group at a time
                df_chunk = parquet_file.read_row_group(batch, columns=columns).to_pandas()
                
                # Convert timestamps to string format if needed
                if isinstance(df_chunk['date'].iloc[0], (pd.Timestamp, datetime)):
                    df_chunk['date'] = df_chunk['date'].dt.strftime('%Y-%m-%d')
                
                # Replace invalid values
                df_chunk = df_chunk.replace([np.inf, -np.inf, np.nan], None)
                
                # Convert to records
                records = df_chunk.to_dict(orient='records')
                result.extend(records)

                # Clear chunk from memory
                del df_chunk
                gc.collect()
            except Exception as e:
                print(f"Error processing batch {batch}: {str(e)}")
                continue

        print(f"Total records fetched: {len(result)}")
        if result:
            print(f"Sample record: {result[0]}")
        else:
            raise ValueError(f"No valid records found for tickers: {request.tickers}")

        # Prepare data for storage
        data_to_store = {
            "data": result,
            "tickers": request.tickers,
            "timestamp": datetime.now().isoformat()
        }

        # Save locally
        with open(data_dir / "pricing_data.json", 'w') as f:
            json.dump(data_to_store, f)

        # Upload to S3 in user's folder
        static_user_id = "default_user"  # You can make this dynamic if needed
        filename = f"pricing_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        s3_key = upload_to_s3(data_to_store, static_user_id, filename)
        
        # Generate presigned URL
        presigned_url = get_presigned_url(s3_key)

        return {
            "status": "success",
            "message": f"Data saved for: {', '.join(request.tickers)}",
            "data_url": presigned_url,
            "expires_in": "1 hour"
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


@app.post("/run_calc")
async def run_calc(request: StockCalcRequest):
    """
    Process a user query to calculate stock performance.
    Uses static date range (Jan 2015 - Jan 2025) and static user_id.
    Requires pricing data to be loaded first via get_pricing_data endpoint.
    
    Args:
        request: StockCalcRequest containing only the user query
    
    Returns:
        Dictionary containing status, ticker, performance shape, and presigned URL
    """
    try:
        # Use static values
        static_user_id = "default_user"
        static_start_date = "2015-01-01"
        static_end_date = "2025-01-31"
        
        # Extract ticker symbol from query
        ticker = extract_ticker_symbol(request.user_query)
        
        if not ticker:
            return {
                "status": "error",
                "message": "Could not identify a stock ticker in your query. Please specify a stock symbol like AAPL or GOOGL."
            }
        
        try:
            # Get the latest pricing data
            price_data, _ = await get_latest_pricing_data(static_user_id)
        except Exception as e:
            return {
                "status": "error",
                "message": f"No pricing data found. Please call /get_pricing_data endpoint first with ticker: {ticker}"
            }
            
        # Verify ticker exists in the data
        if not any(ticker in day for day in price_data):
            return {
                "status": "error",
                "message": f"Ticker {ticker} not found in loaded pricing data. Please load it using /get_pricing_data endpoint first."
            }
        
        # Calculate stock performance using actual pricing data
        performance = calculate_returns_metrics(price_data, ticker, static_start_date, static_end_date)
        
        # Save calculation results
        results_path = Path("sessions") / static_user_id / f"{ticker}_performance.json"
        with open(results_path, 'w') as f:
            json.dump(performance, f, indent=2)
        
        # Upload performance to S3
        filename = f"{ticker}_performance_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        s3_key = upload_to_s3(performance, static_user_id, filename)
        
        # Generate presigned URL
        presigned_url = get_presigned_url(s3_key)
        
        # Calculate performance shape/size
        performance_shape = {
            "total_items": len(performance),
            "time_series_length": performance.get("cumulative_series_length", 0),
            "data_points": sum(len(v) if isinstance(v, list) else 1 for v in performance.values())
        }
        
        return {
            "status": "success",
            "ticker": performance.get("ticker"),
            "period_start": performance.get("period_start"),
            "period_end": performance.get("period_end"),
            "cumulative_performance": performance.get("cumulative_performance"),
            "cumulative_return_series": performance.get("cumulative_series"),
            "performance_shape": performance_shape,
            "calculated_at": performance.get("calculated_at"),
            "url": presigned_url
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error calculating performance: {str(e)}"
        }


class SessionRequest(BaseModel):
    """Base model for requests that require session management."""
    session_id: UUID = Field(..., description="Session identifier")

class NewsRequest(SessionRequest):
    """Request model for news search."""
    query: str = Field(default="market news", description="Search query for news")
    limit: int = Field(default=3, ge=1, le=10, description="Number of news items to return")

class FinancialDataRequest(SessionRequest):
    """Request model for financial data processing."""
    query: str = Field(..., description="Financial query or ticker symbol")
    timeRange: str = Field(default="1y", description="Time range (e.g., '1d', '1w', '1m', '1y')")
    metrics: Optional[List[str]] = Field(default=["close"], description="Metrics to include")

@app.get("/latest_news")
async def get_latest_news(request: NewsRequest = None):
    """
    Get the latest market news and analysis.
    
    Args:
        request: Optional NewsRequest containing search parameters
        
    Returns:
        Dictionary containing status and news summary
    """
    try:
        # Use default query if none provided
        query = request.query if request and request.query else "market news"
        
        # Initialize search agent with instructions
        SEARCH_INSTRUCTIONS = (
            "You are a research assistant focused on market news and analysis. Search for the latest "
            "market developments, stock performance, product launches, and business strategies. "
            "Produce a concise 2-3 paragraph summary under 300 words that captures key market movements, "
            "financial metrics, competitive positioning, and material business updates. Focus on actionable "
            "insights that could impact market value and industry standing. Write succinctly without "
            "complete sentences. Prioritize hard data and market-moving news over speculation. Include only "
            "the factual summary without additional commentary."
        )
        
        search_agent = Agent(
            name="Search agent",
            instructions=SEARCH_INSTRUCTIONS,
            tools=[WebSearchTool()],
            model_settings=ModelSettings(tool_choice="required"),
        )
        
        # Run search agent
        result = await Runner.run(search_agent, f"search for {query}")
        
        # Store the search result in S3
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"news_search_{timestamp}.json"
        data = {
            "query": query,
            "timestamp": datetime.now().isoformat(),
            "summary": result.final_output
        }
        
        # Upload to S3 and get URL
        s3_key = upload_to_s3(data, "default_user", filename)
        presigned_url = get_presigned_url(s3_key)
        
        return {
            "status": "success",
            "query": query,
            "news": result.final_output,
            "timestamp": data["timestamp"],
            "url": presigned_url
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching latest news: {str(e)}"
        )

@app.get("/session_summary/{session_id}")
async def get_session_summary(session_id: UUID):
    """Get summary of all data and operations in a session."""
    try:
        summary = await session_manager.get_session_summary(session_id)
        return {"status": "success", "summary": summary}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Session not found")

@app.post("/process_financial_data")
async def process_financial_data(request: FinancialDataRequest):
    """
    Process financial time series data for a given query.
    Returns pricing data for the requested ticker.
    """
    try:
        # Extract ticker from query
        ticker = extract_ticker_symbol(request.query)
        
        if not ticker:
            return {
                "status": "error",
                "error": {
                    "code": "INVALID_SYMBOL",
                    "message": "Could not identify a stock ticker in your query"
                }
            }
        
        # Initialize or get session
        await session_manager.initialize_session(request.session_id)
        
        # Get pricing data for this ticker using session manager
        pricing_data = await session_manager.get_or_update_pricing_data(request.session_id, ticker)
        
        if not pricing_data or 'data' not in pricing_data:
            return {
                "status": "error",
                "error": {
                    "code": "NO_DATA",
                    "message": f"No data available for ticker {ticker}"
                }
            }
        
        # Generate data ID
        data_id = f"fin-{uuid.uuid4()}"
        
        # Filter data for just this ticker's info
        ticker_data = []
        for record in pricing_data['data']:
            if ticker in record:
                filtered_record = {
                    'date': record['date'],
                    ticker: record[ticker]
                }
                ticker_data.append(filtered_record)
        
        # Prepare response data
        processed_data = {
            "status": "success",
            "query": {
                "symbol": ticker,
                "metrics": request.metrics
            },
            "data": ticker_data,  # Only return data for requested ticker
            "metadata": {
                "dataSource": "Session Storage",
                "dataId": data_id,
                "sessionId": str(request.session_id)
            }
        }
        
        # Update session summary
        await session_manager.update_session_summary(
            session_id=request.session_id,
            ticker=ticker,
            operation_type="process_financial_data",
            metrics=request.metrics,
            time_range=request.timeRange
        )
        
        return processed_data
        
    except Exception as e:
        print(f"Error in process_financial_data: {str(e)}")
        return {
            "status": "error",
            "error": {
                "code": "PROCESSING_ERROR",
                "message": str(e),
                "details": str(e)
            }
        }

@app.post("/get_pricing_data2")
async def get_pricing_data2(request: PricingRequest):
    """
    Get pricing data from S3 for the requested tickers.
    Supports both default and custom data modes.
    """
    try:
        # Initialize S3 client with environment variables
        s3_client = boto3.client('s3',
                                region_name='us-east-1',
                                aws_access_key_id=AWS_ACCESS_KEY_ID,
                                aws_secret_access_key=AWS_SECRET_ACCESS_KEY)
        
        # Determine file path based on mode
        if request.mode == 'default':
            file_path = 'az_pricing_04112025.parquet'
        else:
            file_path = f'users/{request.user_id}/{request.data_id}.parquet'

        print(f"Fetching data from S3: {file_path}")
        
        try:
            # Get the parquet file metadata first
            response = s3_client.get_object(Bucket=AWS_S3_BUCKET, Key=file_path)
        except Exception as e:
            print(f"Error fetching from S3: {str(e)}")
            raise ValueError(f"Failed to fetch data from S3: {str(e)}")

        # Create a ParquetFile object to enable reading in pieces
        parquet_file = pq.ParquetFile(BytesIO(response['Body'].read()))

        # Read only the columns we need
        columns = ['date'] + request.tickers
        print(f"Reading columns: {columns}")

        # Process in chunks
        result = []
        for batch in range(parquet_file.num_row_groups):
            try:
                # Read one row group at a time
                df_chunk = parquet_file.read_row_group(batch, columns=columns).to_pandas()
                
                # Convert timestamps to string format if needed
                if isinstance(df_chunk['date'].iloc[0], (pd.Timestamp, datetime)):
                    df_chunk['date'] = df_chunk['date'].dt.strftime('%Y-%m-%d')
                
                # Replace invalid values
                df_chunk = df_chunk.replace([np.inf, -np.inf, np.nan], None)
                
                # Convert to records
                records = df_chunk.to_dict(orient='records')
                result.extend(records)

                # Clear chunk from memory
                del df_chunk
                gc.collect()
            except Exception as e:
                print(f"Error processing batch {batch}: {str(e)}")
                continue

        print(f"Total records fetched: {len(result)}")
        if result:
            print(f"Sample record: {result[0]}")
        else:
            raise ValueError(f"No valid records found for tickers: {request.tickers}")

        return {"data": result}

    except Exception as e:
        print(f"Error loading pricing data: {str(e)}")
        raise
    finally:
        # Final cleanup
        gc.collect()

def make_dataframe_json_serializable(df: pd.DataFrame) -> dict:
    """Convert DataFrame to JSON serializable format."""
    try:
        # Convert DataFrame to dictionary
        df_dict = df.replace([np.inf, -np.inf, np.nan], None).to_dict()
        return df_dict
    except Exception as e:
        print(f"Error converting DataFrame to JSON: {str(e)}")
        return {}

@app.post("/store_pricing_data/{session_id}")
async def store_pricing_data(session_id: str,
                             request: DataRequest) -> DataResponse:
    """Store pricing data for analysis"""
    try:
        # Get pricing data using the existing endpoint functionality
        if request.mode == 'custom':
            pricing_response = await get_pricing_data2(
                PricingRequest(
                    mode='custom',
                    tickers=request.tickers,
                    user_id=request.user_id,
                    data_id=request.data_id
                ))
        else:
            pricing_response = await get_pricing_data2(
                PricingRequest(
                    mode='default',
                    tickers=request.tickers
                ))

        if not pricing_response or "data" not in pricing_response:
            raise HTTPException(status_code=500,
                                detail="Failed to fetch pricing data")
        
        # Convert the response data to a DataFrame
        df = pd.DataFrame(pricing_response["data"])
        
        # Save the DataFrame using the session manager
        if not session_manager.save_dataframe(df, session_id, "pricing_data"):
            raise HTTPException(
                status_code=500,
                detail="Failed to save pricing data to session storage"
            )
        
        # Update session metadata with query information
        metadata_updates = {
            "last_accessed": datetime.now(timezone.utc).isoformat(),
            "query_prompt": request.query_prompt,
            "tickers": request.tickers,
            "fields": request.fields
        }
        session_manager.update_session_metadata(session_id, metadata_updates)

        return DataResponse(
            session_id=session_id,
            data_type="pricing_data", 
            message=f"Pricing data stored for {len(request.tickers)} tickers"
        )
    except Exception as e:
        print(f"Error in store_pricing_data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Add these models after your existing model definitions
class QueryInfo(BaseModel):
    """Information about the query being processed."""
    type: str = Field(..., description="Type of query (e.g., 'price_history', 'financial_statements')")
    tickers: List[str] = Field(..., description="List of tickers to process")

class DataShape(BaseModel):
    """Information about the data structure."""
    rows: int = Field(..., description="Number of rows in the dataset")
    columns: int = Field(..., description="Number of columns in the dataset")
    fields: List[str] = Field(..., description="List of field names in the dataset")

class TimeRange(BaseModel):
    """Time range information for time series data."""
    start: str = Field(..., description="Start date of the time series")
    end: str = Field(..., description="End date of the time series")

class DataProfile(BaseModel):
    """High-level overview of the data."""
    timeRange: Optional[TimeRange] = Field(None, description="Time range for time series data")
    missingValues: Optional[int] = Field(None, description="Number of missing values in the dataset")
    uniqueValues: Optional[Dict[str, int]] = Field(None, description="Number of unique values per field")

class SummaryStats(BaseModel):
    """Summary statistics about the data."""
    shape: DataShape
    dataProfile: DataProfile

class DataContent(BaseModel):
    """The actual data content."""
    type: Literal["timeSeries", "tabular"]
    content: Any

class DataMetadata(BaseModel):
    """Metadata about the data."""
    dataSource: str = Field(..., description="Source of the data")
    lastUpdated: str = Field(..., description="Last update timestamp")

class FinancialResponse(BaseModel):
    """Complete response model for financial data queries."""
    status: Literal["success", "error"]
    query: QueryInfo
    data: DataContent
    summaryStats: SummaryStats
    metadata: DataMetadata

class ProcessQueryRequest(BaseModel):
    """Request model for processing financial queries."""
    query: str = Field(..., description="Natural language query to process")
    session_id: UUID = Field(..., description="Session identifier")




class DataProcessRequest(BaseModel):
    """Request parameters for data processing."""
    tickers: List[str]
    start_date: str  # ISO format date string
    end_date: str    # ISO format date string
    session_id: str  # Session ID for retrieving stored data
    transformation_type: str  # Type of transformation to apply (e.g., 'cumulative_performance')

class ProcessDataResponse(BaseModel):
    """Response model for data processing."""
    status: str
    path: str
    summary: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Summary statistics including cumulative returns and date range"
    )


@function_tool
async def process_stock_data(request: DataProcessRequest) -> ProcessDataResponse:
    """
    Process stock data based on the request parameters and save results to a JSON file in S3.
    Now includes summary statistics in the response.
    """
    from pathlib import Path
    import pandas as pd
    import numpy as np
    from datetime import datetime
    from itertools import accumulate
    import boto3
    import io
    import json
    
    def sample_timeseries_data(df: pd.DataFrame, min_points_to_sample: int = 200, target_points: int = 100) -> pd.DataFrame:
        """
        Automatically sample timeseries data if it exceeds min_points_to_sample.
        Always keeps first and last points, and samples evenly in between.
        """
        if len(df) <= min_points_to_sample:
            return df
            
        # Always include first and last points
        step = max(1, len(df) // target_points)
        sampled_indices = list(range(0, len(df), step))
        if len(df) - 1 not in sampled_indices:
            sampled_indices.append(len(df) - 1)
        return df.iloc[sorted(sampled_indices)].copy()
    
    # 1. Load data from session storage
    session_id = request.session_id
    
    # Create path to session's pricing data
    session_path = Path("sessions") / session_id
    pricing_data_path = session_path / "pricing_data.parquet"
    
    if not pricing_data_path.exists():
        raise ValueError(f"No pricing data found for session {session_id}. Please load data first.")
    
    # Load the stored parquet file
    df = pd.read_parquet(pricing_data_path)
    
    # 2. Filter for our tickers of interest
    tickers = request.tickers
    available_columns = df.columns.tolist()
    
    # Make sure we have the date column
    if "date" not in available_columns:
        raise ValueError("Date column not found in the pricing data")
    
    # Identify which requested tickers are available
    available_tickers = [ticker for ticker in tickers if ticker in available_columns]
    
    if not available_tickers:
        raise ValueError(f"None of the requested tickers {tickers} found in data. Available columns: {available_columns}")
    
    # Keep only the date and available tickers
    df = df[["date"] + available_tickers]
    
    # 3. Filter by date range
    # Ensure date is in datetime format
    if not pd.api.types.is_datetime64_any_dtype(df["date"]):
        df["date"] = pd.to_datetime(df["date"])
    
    # Filter by date range if specified
    start_date = request.start_date
    end_date = request.end_date
    
    if start_date:
        start_date = pd.to_datetime(start_date)
        df = df[df["date"] >= start_date]
    
    if end_date:
        end_date = pd.to_datetime(end_date)
        df = df[df["date"] <= end_date]
    
    # Check if we have enough data after filtering
    if len(df) < 2:
        raise ValueError("Insufficient data after date filtering. Need at least two data points.")
    
    # Sort by date to ensure proper order
    df = df.sort_values("date")
    print(f"Filtered df: {df.head()}")
    # 4. Apply the specified transformation
    transformation_type = request.transformation_type
    
    if transformation_type == "cumulative_performance":
        # Create a results dataframe with date column
        result_df = pd.DataFrame({"date": df["date"].dt.strftime('%Y-%m-%d')})
        
        # Initialize summary dictionary
        summary = {
            "start_date": df["date"].min().strftime('%Y-%m-%d'),
            "end_date": df["date"].max().strftime('%Y-%m-%d'),
            "cumulative_returns": {}
        }
        
        for ticker in available_tickers:
            # Create a clean series of the price data, removing NaN values
            price_series = df[ticker].dropna()
            
            # Skip tickers with insufficient data
            if len(price_series) < 2:
                continue
                
            # Calculate daily returns
            daily_returns = price_series.pct_change().fillna(0)
            
            # Calculate cumulative returns (starting at 100)
            cumulative_returns = 100 * (1 + daily_returns).cumprod()
            
            # Round to 2 decimal places and add to result dataframe
            result_df[ticker] = cumulative_returns.values.round(2)
            
            # Store the final cumulative return in the summary, rounded to 2 decimals
            summary["cumulative_returns"][ticker] = round(float(cumulative_returns.iloc[-1]), 2)

        # Automatically sample the data if we have too many points
        result_df = sample_timeseries_data(result_df)
        print(f"Sampled df: {result_df.head()}")
    else:
        raise ValueError(f"Transformation type '{transformation_type}' not supported. Supported types: cumulative_performance")
    
    # 5. Save the processed data to S3 as JSON
    # Create a filename based on the transformation type and date
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    result_filename = f"{transformation_type}_{timestamp}.json"
    
    # Set up S3 client with environment variables
    s3_client = boto3.client('s3',
                           region_name='us-east-1',
                           aws_access_key_id=AWS_ACCESS_KEY_ID,
                           aws_secret_access_key=AWS_SECRET_ACCESS_KEY)
    
    # Create S3 path
    s3_path = f"users/{session_id}/processed/{result_filename}"
    
    # Convert DataFrame to JSON
    # Replace NaN values with None for JSON serialization
    result_df = result_df.replace({np.nan: None})
    result_json = {
        "data": result_df.to_dict(orient="records"),
        "metadata": {
            "transformation_type": transformation_type,
            "tickers": available_tickers,
            "start_date": start_date.strftime('%Y-%m-%d') if start_date else None,
            "end_date": end_date.strftime('%Y-%m-%d') if end_date else None,
            "generated_at": datetime.now().isoformat(),
            "row_count": len(result_df),
            "session_id": session_id
        }
    }
    
    # Save to S3
    s3_client.put_object(
        Bucket=AWS_S3_BUCKET,
        Key=s3_path,
        Body=json.dumps(result_json, default=str),
        ContentType='application/json'
    )
    
    # Also save a local copy for reference (optional)
    session_path.mkdir(parents=True, exist_ok=True)
    local_path = session_path / result_filename
    with open(local_path, 'w') as f:
        json.dump(result_json, f, default=str)
    
    # Return response with status, path, and summary
    return ProcessDataResponse(
        status="success",
        path=f"s3://{AWS_S3_BUCKET}/{s3_path}",
        summary=summary
    )

class AgentStockResponse(BaseModel):
    status: str = Field(..., description="Processing status (success/error)")
    path: str = Field(..., description="S3 path to the processed data")
    start_date: Optional[str] = Field(None, description="Start date of analysis")
    end_date: Optional[str] = Field(None, description="End date of analysis")
    cumulative_returns: Optional[Dict[str, float]] = Field(
        None, 
        description="Dictionary mapping ticker symbols to their cumulative returns"
    )

@app.post("/process_query")
async def process_query(request: ProcessQueryRequest):
    """
    Process a financial query and return structured data with comprehensive metadata.
    Uses get_tickers internally to extract tickers from the query,
    processes the data with an agent, and stores results in S3.
    """
    try:
        # 1. Get tickers from the query using get_tickers endpoint
        tickers_response = await get_tickers(QueryParams(user_query=request.query))
        tickers = tickers_response["tickers"]
        
        if not tickers:
            return {
                "status": "error",
                "message": "No tickers identified in the query",
                "session_id": str(request.session_id),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

        # 2. Get pricing data
        pricing_response = await get_pricing_data2(
            PricingRequest(mode="default", tickers=tickers)
        )

        if not pricing_response or "data" not in pricing_response:
            raise HTTPException(status_code=500, detail="Failed to fetch pricing data")

        # 3. Convert to DataFrame for analysis
        df = pd.DataFrame(pricing_response["data"])
        
        # 4. Save the processed data in the provided session
        await session_manager.initialize_session(request.session_id)
        session_path = Path("sessions") / str(request.session_id)
        pricing_data_path = session_path / "pricing_data.parquet"
        
        if not session_manager.save_dataframe(df, str(request.session_id), "pricing_data"):
            raise HTTPException(
                status_code=500,
                detail="Failed to save pricing data to session storage"
            )
        from agents import enable_verbose_stdout_logging
        enable_verbose_stdout_logging()
        # 5. Create the agent with the function tool
        today = datetime.today().strftime('%Y-%m-%d')
        agent = Agent(
            name="Stock Data Processor",
            tools=[process_stock_data],
            output_type=AgentStockResponse,
            model="gpt-4o-mini",
            instructions=f"""You are a stock data processing assistant. 
Your job is to understand natural language queries about stock data and call the process_stock_data function with the appropriate parameters.
Always call the process_stock_data function with the correct parameters based on the query.
Today's date is {today}. Use it to calculate the date range for relative dates.

When you receive a query:
1. Extract the stock tickers mentioned (e.g., AAPL, MSFT, GOOG)
2. Determine the date range requested
   - For relative dates like "last 3 months", calculate the actual date range
   - For specific dates like "from January to March 2023", use those exact dates
3. Identify the session ID if provided, or use {request.session_id}
4. Determine the transformation type requested (currently only 'cumulative_performance' is supported)
5. Format these as parameters for the process_stock_data function
6. Call the function with these parameters
7. Return the complete ProcessDataResponse, which includes:
   - status: The processing status
   - path: The path to the saved data
   - summary: The summary statistics including start_date, end_date, and cumulative_returns

Examples:
- "Show me cumulative performance for AAPL and MSFT over the last 6 months in session abc-123"
  → Parameters:
    - tickers: ["AAPL", "MSFT"]
    - start_date: [six months ago]
    - end_date: [today]
    - session_id: "abc-123"
    - transformation_type: "cumulative_performance"
  → Response:
    {{
      "status": "success",
      "path": "s3://bucket/sessions/abc-123/processed_data.parquet", 
      "start_date": "2023-09-24",
      "end_date": "{today}",
      "cumulative_returns": {{
        "AAPL": 0.234,
        "MSFT": 0.187
      }}
    }}


Important: Make sure to return the complete ProcessDataResponse object with all fields, including the summary data.
Do not explain what you're doing, just call the function with the correct parameters based on the query."""
        )
        
        # 6. Run the agent with the query
        result = await Runner.run(agent, request.query)
        
        # Add debug logging
        print("\nDebug: Examining agent result")
        print(f"Result type: {type(result)}")
        print(f"Result attributes: {dir(result)}")
        
        # Extract data from result
        s3_path = None
        start_date = None
        end_date = None
        cumulative_returns = None
        
        if hasattr(result, "function_results") and result.function_results:
            print("\nDebug: Found function_results")
            func_result = result.function_results[0]
            s3_path = func_result.path
            start_date = func_result.start_date
            end_date = func_result.end_date
            cumulative_returns = func_result.cumulative_returns
        elif hasattr(result, "final_output"):
            print("\nDebug: Found final_output")
            s3_path = result.final_output.path
            start_date = result.final_output.start_date
            end_date = result.final_output.end_date
            cumulative_returns = result.final_output.cumulative_returns
        
        # Generate presigned URL if needed
        presigned_url = None
        if s3_path and s3_path.startswith("s3://"):
            bucket_end = s3_path.find("/", 5)
            if bucket_end != -1:
                bucket_name = s3_path[5:bucket_end]
                s3_key = s3_path[bucket_end+1:]
                presigned_url = get_presigned_url(s3_key, expiration=86400)
        
        # Return response
        response = {
            "status": "success",
            "tickers": tickers,
            "session_id": str(request.session_id),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "result_path": s3_path,
            "presigned_url": presigned_url,
            "start_date": start_date,
            "end_date": end_date,
            "cumulative_returns": cumulative_returns
        }
        
        print("\nDebug: Final response")
        print(json.dumps(response, indent=2))
        
        return response
    except Exception as e:
        print(f"Error processing query: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return {
            "status": "error",
            "message": str(e)
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)