terraform {
  # Require a modern version of Terraform
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket         = "oil-gas-terraform-state-bucket"
    key            = "infrastructure/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  # This automatically applies these tags to EVERY resource Terraform creates.
  # It is a lifesaver for tracking AWS billing costs later.
  default_tags {
    tags = {
      Project     = "Oil-Gas-MLOps"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}