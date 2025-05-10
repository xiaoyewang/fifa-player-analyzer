# FIFA Player Analyzer Deployment Guide

This guide explains how to deploy the FIFA Player Analyzer application to AWS using the AWS Cloud Development Kit (CDK).

## Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. Node.js (v14+) and npm installed
4. AWS CDK installed globally: `npm install -g aws-cdk`
5. GitHub account to host your repository

## Step 1: Push to GitHub

1. Create a new GitHub repository named "fifa-player-analyzer"

2. Push your local repository to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/fifa-player-analyzer.git
   git push -u origin main
   ```

## Step 2: Configure AWS CDK

1. Navigate to the CDK directory:
   ```bash
   cd cdk
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Bootstrap your AWS environment (only needed once per AWS account/region):
   ```bash
   cdk bootstrap aws://YOUR_AWS_ACCOUNT_ID/us-east-1
   ```

4. Update the GitHub repository URL in the CDK stack:
   Edit `lib/fifa-player-analyzer-stack.ts` and replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

## Step 3: Create EC2 Key Pair

1. In the AWS Management Console, navigate to EC2 > Key Pairs
2. Create a new key pair named `fifa-player-analyzer-key`
3. Download and save the private key file (.pem)
4. Set appropriate permissions: `chmod 400 fifa-player-analyzer-key.pem`

## Step 4: Deploy the Application

1. Synthesize the CloudFormation template:
   ```bash
   cdk synth
   ```

2. Deploy the stack:
   ```bash
   cdk deploy
   ```

3. Note the outputs from the deployment, which include:
   - InstancePublicIp: The public IP address of the EC2 instance
   - ApplicationUrl: The URL to access the application

## Step 5: Access the Application

1. Wait approximately 5-10 minutes for the EC2 instance to complete its setup
2. Open a web browser and navigate to the ApplicationUrl provided in the CDK outputs
3. You should see the FIFA Player Analyzer application running

## Step 6: Set Up CI/CD Pipeline (Optional)

For continuous integration and deployment, you can set up a GitHub Actions workflow:

1. Create a directory for GitHub workflows:
   ```bash
   mkdir -p .github/workflows
   ```

2. Create a workflow file `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy FIFA Player Analyzer

   on:
     push:
       branches: [ main ]

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         
         - name: Configure AWS credentials
           uses: aws-actions/configure-aws-credentials@v1
           with:
             aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
             aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
             aws-region: us-east-1
             
         - name: Install dependencies
           run: |
             npm install -g aws-cdk
             cd cdk
             npm install
             
         - name: Deploy with CDK
           run: |
             cd cdk
             cdk deploy --require-approval never
   ```

3. In your GitHub repository, add the following secrets:
   - AWS_ACCESS_KEY_ID: Your AWS access key
   - AWS_SECRET_ACCESS_KEY: Your AWS secret key

## Troubleshooting

### SSH Access to EC2 Instance

If you need to troubleshoot issues on the EC2 instance:

```bash
ssh -i fifa-player-analyzer-key.pem ec2-user@YOUR_INSTANCE_IP
```

### View Application Logs

```bash
# Backend logs
sudo journalctl -u fifa-backend

# Frontend logs
sudo journalctl -u fifa-frontend

# Nginx logs
sudo cat /var/log/nginx/error.log
```

### Restart Services

```bash
sudo systemctl restart fifa-backend
sudo systemctl restart fifa-frontend
sudo systemctl restart nginx
```

## Cleanup

To avoid incurring charges, delete the resources when not in use:

```bash
cd cdk
cdk destroy
```
