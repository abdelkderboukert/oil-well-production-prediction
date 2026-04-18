module "irsa_role" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.0"

  role_name = "OilGasEksAccessRole"

  # Attach standard AWS policies for S3 and Secrets Manager
  role_policy_arns = {
    s3_access      = aws_iam_policy.s3_ml_policy.arn
    secrets_access = aws_iam_policy.secrets_policy.arn
  }

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["production:oil-gas-app-sa"]
    }
  }
}

# Example custom policy to restrict S3 access to just your bucket
resource "aws_iam_policy" "s3_ml_policy" {
  name        = "OilGasS3MLPolicy"
  description = "Allows pods to read/write to the ML models S3 bucket"
  policy      = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = ["s3:GetObject", "s3:PutObject", "s3:ListBucket"]
        Effect   = "Allow"
        Resource = [
          aws_s3_bucket.ml_data.arn,
          "${aws_s3_bucket.ml_data.arn}/*"
        ]
      }
    ]
  })
}