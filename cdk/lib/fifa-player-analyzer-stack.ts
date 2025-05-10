import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as path from 'path';

export class FifaPlayerAnalyzerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a VPC
    const vpc = new ec2.Vpc(this, 'FifaPlayerAnalyzerVpc', {
      maxAzs: 2,
      natGateways: 0, // Save costs by not using NAT gateways
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
        }
      ]
    });

    // Create a security group for the EC2 instance
    const securityGroup = new ec2.SecurityGroup(this, 'FifaPlayerAnalyzerSG', {
      vpc,
      description: 'Allow SSH (22) and HTTP (80) access',
      allowAllOutbound: true,
    });

    // Allow SSH access from anywhere (you might want to restrict this in production)
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'Allow SSH access'
    );

    // Allow HTTP access
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP access'
    );

    // Allow access to the backend API port
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(5001),
      'Allow backend API access'
    );

    // Create an IAM role for the EC2 instance
    const role = new iam.Role(this, 'FifaPlayerAnalyzerRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
      ],
    });

    // Add Bedrock permissions to the role
    role.addToPolicy(new iam.PolicyStatement({
      actions: [
        'bedrock:InvokeModel',
        'bedrock:ListFoundationModels',
      ],
      resources: ['*'], // You might want to restrict this in production
    }));

    // Create an S3 bucket for application code
    const bucket = new s3.Bucket(this, 'FifaPlayerAnalyzerBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Create the EC2 instance
    const instance = new ec2.Instance(this, 'FifaPlayerAnalyzerInstance', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.SMALL),
      machineImage: ec2.MachineImage.latestAmazonLinux2023({
        cachedInContext: true,
      }),
      securityGroup,
      role,
      keyName: 'fifa-player-analyzer-key', // Make sure to create this key pair in the AWS console
    });

    // Add user data script to set up the application
    const userDataScript = `#!/bin/bash
# Update system packages
dnf update -y

# Install Node.js
dnf install -y nodejs

# Install Git
dnf install -y git

# Install nginx
dnf install -y nginx

# Configure nginx as a reverse proxy
cat > /etc/nginx/conf.d/fifa-player-analyzer.conf << 'EOL'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOL

# Start and enable nginx
systemctl start nginx
systemctl enable nginx

# Clone the application repository
mkdir -p /opt/fifa-player-analyzer
cd /opt/fifa-player-analyzer
git clone https://github.com/xiaoyewang/fifa-player-analyzer.git .

# Install backend dependencies
cd /opt/fifa-player-analyzer/backend
npm install

# Install frontend dependencies
cd /opt/fifa-player-analyzer/frontend
npm install

# Build the frontend
npm run build

# Create systemd service for backend
cat > /etc/systemd/system/fifa-backend.service << 'EOL'
[Unit]
Description=FIFA Player Analyzer Backend
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/fifa-player-analyzer/backend
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment=PORT=5001
Environment=AWS_REGION=us-east-1

[Install]
WantedBy=multi-user.target
EOL

# Create systemd service for frontend
cat > /etc/systemd/system/fifa-frontend.service << 'EOL'
[Unit]
Description=FIFA Player Analyzer Frontend
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/fifa-player-analyzer/frontend
ExecStart=/usr/bin/npx serve -s build -l 3000
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOL

# Start and enable services
systemctl daemon-reload
systemctl start fifa-backend
systemctl enable fifa-backend
systemctl start fifa-frontend
systemctl enable fifa-frontend
`;

    instance.addUserData(userDataScript);

    // Output the public IP address of the EC2 instance
    new cdk.CfnOutput(this, 'InstancePublicIp', {
      value: instance.instancePublicIp,
      description: 'Public IP address of the FIFA Player Analyzer application',
    });

    // Output the URL of the application
    new cdk.CfnOutput(this, 'ApplicationUrl', {
      value: `http://${instance.instancePublicIp}`,
      description: 'URL of the FIFA Player Analyzer application',
    });
  }
}
