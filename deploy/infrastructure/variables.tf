variable "aws_region" {
  description = "The AWS region to deploy infrastructure into"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "The deployment environment (e.g., dev, staging, production)"
  type        = string
  default     = "developemnt"
}

variable "db_password" {
    type = string
    default = "c64519dc7522aee43d197b2fecaaa69b"
}