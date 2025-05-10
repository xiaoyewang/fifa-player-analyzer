#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FifaPlayerAnalyzerStack } from '../lib/fifa-player-analyzer-stack';

const app = new cdk.App();
new FifaPlayerAnalyzerStack(app, 'FifaPlayerAnalyzerStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: 'us-east-1' // Explicitly set to us-east-1 for Bedrock access
  },
  description: 'FIFA Player Analyzer application with AI chat capabilities',
});
