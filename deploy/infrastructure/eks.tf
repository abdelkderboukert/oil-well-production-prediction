module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "oil-gas-prod-cluster"
  cluster_version = "1.30"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  # CRITICAL: Enables IAM Roles for Service Accounts
  enable_irsa = true 

  eks_managed_node_groups = {
    general_compute = {
      min_size     = 2
      max_size     = 5
      desired_size = 2
      instance_types = ["t3.large"]
    }
  }
}