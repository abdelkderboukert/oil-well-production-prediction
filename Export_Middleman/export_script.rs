use anyhow::{Context, Result};
use aws_sdk_s3::primitives::ByteStream;
use chrono::{NaiveDate, Utc};
use rust_decimal::Decimal;
use sqlx::postgres::PgPoolOptions;
use std::env;
use std::fs; // Added for saving files locally

#[derive(sqlx::FromRow)]
struct ProductionRow {
    date: NaiveDate,
    well_name: String,
    hours: Decimal,
    whp: Decimal,
    wht: Decimal,
    wlp: Decimal,
    h2o: Decimal,
    water: Decimal,
    prodindex: Option<Decimal>,
    w_gas: Decimal,
    s_gas: Decimal,
    lpg_mass: Decimal,
    lpg_vol: Decimal,
    cond_vol: Decimal,
    cond_mass: Decimal,
    c2m: Option<Decimal>,
    c3: Option<Decimal>,
    c4: Option<Decimal>,
    c5p: Option<Decimal>,
    tag: bool,
}

#[tokio::main]
async fn main() -> Result<()> {
    dotenvy::dotenv().ok();

    // Check if we are in development or production
    let environment = env::var("ENVIRONMENT").unwrap_or_else(|_| "development".to_string());

    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .context("Failed to connect to Postgres")?;

    println!("SUCCESS: Connected to Database");

    let rows = sqlx::query_as::<_, ProductionRow>(
        r#"
        SELECT 
            p.date, w.name as well_name, p.hours_on_stream as hours, p.whp, p.wht, p.wlp, 
            p.h2o, p.water, p.prodindex, p.gas_flow_rate as w_gas, p.s_gas, p.lpg_mass, 
            p.lpg_vol, p.cond_vol, p.cond_mass, p.c2m, p.c3, p.c4, p.c5p, p.tag
        FROM api_wellproduction p
        JOIN api_well w ON p.well_id = w.id
        ORDER BY w.name, p.date DESC
        "#,
    )
    .fetch_all(&pool)
    .await
    .context("Failed to execute query")?;

    println!("SUCCESS: Fetched {} rows", rows.len());

    let mut wtr = csv::Writer::from_writer(vec![]);
    wtr.write_record(&[
        "DATE",
        "WELL",
        "HOURS",
        "WHP",
        "WHT",
        "WLP",
        "H2O",
        "WATER",
        "prodindex",
        "W_GAS",
        "S_GAS",
        "LPG_MASS",
        "LPG_VOL",
        "COND_VOL",
        "COND_MASS",
        "C2M",
        "C3",
        "C4",
        "C5P",
        "TAG",
    ])?;

    for row in rows {
        wtr.write_record(&[
            row.date.to_string(),
            row.well_name,
            row.hours.to_string(),
            row.whp.to_string(),
            row.wht.to_string(),
            row.wlp.to_string(),
            row.h2o.to_string(),
            row.water.to_string(),
            row.prodindex.map(|v| v.to_string()).unwrap_or_default(),
            row.w_gas.to_string(),
            row.s_gas.to_string(),
            row.lpg_mass.to_string(),
            row.lpg_vol.to_string(),
            row.cond_vol.to_string(),
            row.cond_mass.to_string(),
            row.c2m.map(|v| v.to_string()).unwrap_or_default(),
            row.c3.map(|v| v.to_string()).unwrap_or_default(),
            row.c4.map(|v| v.to_string()).unwrap_or_default(),
            row.c5p.map(|v| v.to_string()).unwrap_or_default(),
            row.tag.to_string(),
        ])?;
    }

    let csv_data = wtr.into_inner()?;
    println!("SUCCESS: CSV generated ({} bytes)", csv_data.len());

    // --- SMART ROUTING: Local vs AWS S3 ---
    if environment.to_lowercase() == "production" {
        let bucket_name = env::var("S3_BUCKET_NAME")
            .expect("S3_BUCKET_NAME must be set in production environment");

        let config = aws_config::load_from_env().await;
        let client = aws_sdk_s3::Client::new(&config);

        let key = format!(
            "exports/training_data_{}.csv",
            Utc::now().format("%Y%m%d_%H%M%S")
        );

        client
            .put_object()
            .bucket(&bucket_name)
            .key(&key)
            .body(ByteStream::from(csv_data))
            .send()
            .await
            .context("Failed to upload to S3")?;

        println!("PRODUCTION: Uploaded to s3://{}/{}", bucket_name, key);
    } else {
        // Development mode: Save locally so your Python script can read it
        let local_dir = "data";
        fs::create_dir_all(local_dir).context("Failed to create local data directory")?;

        let local_path = format!("{}/raw_data.csv", local_dir);
        fs::write(&local_path, csv_data).context("Failed to write CSV locally")?;

        println!("DEVELOPMENT: Saved CSV locally to {}", local_path);
    }

    Ok(())
}