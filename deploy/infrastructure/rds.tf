module "db" {
  source  = "terraform-aws-modules/rds/aws"
  version = "~> 6.0"

  identifier = "oil-gas-prod-db"

  engine               = "postgres"
  engine_version       = "15"
  family               = "postgres15"
  major_engine_version = "15"
  instance_class       = "db.t4g.micro"

  allocated_storage = 50

  # Match your .env file
  db_name  = "oil_gas_db"
  username = "postgres"
  port     = 5432

  password = var.db_password 
  manage_master_user_password = false

  # Secure networking
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  subnet_ids             = module.vpc.private_subnets

  # Required for clean DevOps tear-downs
  skip_final_snapshot = true
  deletion_protection = false
}