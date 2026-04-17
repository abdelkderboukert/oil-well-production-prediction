import csv
import io
import os
import sys
import boto3
import psycopg2
from datetime import datetime
from psycopg2.extras import RealDictCursor

# 1. Configuration (Prioritizing Environment Variables for DevOps Best Practice)
DB_CONFIG = {
    "dbname": os.getenv("DB_NAME", "oil_gas_db"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "c64519dc7522aee43d197b2fecaaa69b"),
    "host": os.getenv("DB_HOST", "127.0.0.1"),
    "port": os.getenv("DB_PORT", "5432"),
}

S3_BUCKET = os.getenv("S3_BUCKET_NAME", "your-production-data-bucket")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

def get_data_from_postgres():
    """Extracts joined data directly via SQL to mimic select_related."""
    query = """
        SELECT 
            p.date, w.name as well_name, p.hours, p.whp, p.wht, p.wlp, 
            p.h2o, p.water, p.prodindex, p.w_gas, p.s_gas, p.lpg_mass, 
            p.lpg_vol, p.cond_vol, p.cond_mass, p.c2m, p.c3, p.c4, p.c5p, p.tag
        FROM production_wellproduction p
        JOIN production_well w ON p.well_id = w.id
        ORDER BY w.name, p.date DESC;
    """
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        # Using RealDictCursor to map columns to names automatically
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(query)
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return rows
    except Exception as e:
        print(f"CRITICAL: Database connection failed: {e}")
        sys.exit(1)

def upload_to_s3(csv_data, filename):
    """Uploads string buffer to S3."""
    s3_client = boto3.client('s3', region_name=AWS_REGION)
    try:
        s3_client.put_object(
            Bucket=S3_BUCKET,
            Key=f"exports/{datetime.now().strftime('%Y/%m/%d')}/{filename}",
            Body=csv_data
        )
        print(f"SUCCESS: Uploaded {filename} to {S3_BUCKET}")
    except Exception as e:
        print(f"CRITICAL: S3 Upload failed: {e}")
        sys.exit(1)

def main():
    # 1. Fetch
    data = get_data_from_postgres()
    
    # 2. Transform to CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header matching your ML pipeline
    header = [
        'DATE', 'WELL', 'HOURS', 'WHP', 'WHT', 'WLP', 
        'H2O', 'WATER', 'prodindex', 'W_GAS', 'S_GAS', 'LPG_MASS', 
        'LGP_VOL', 'COND_VOL', 'COND_MASS', 'C2M', 'C3', 'C4', 'C5P', 'TAG'
    ]
    writer.writerow(header)

    for row in data:
        writer.writerow(row.values())

    # 3. Load
    filename = "all_wells_production_data.csv"
    upload_to_s3(output.getvalue(), filename)

if __name__ == "__main__":
    main()