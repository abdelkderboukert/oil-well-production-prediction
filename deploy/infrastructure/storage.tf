resource "aws_s3_bucket" "ml_data" {
  bucket = "your-production-data-bucket-unique-id"
}

resource "aws_secretsmanager_secret" "db_credentials" {
  name = "prod/oil-gas/db"
}