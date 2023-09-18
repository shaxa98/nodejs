#!/bin/bash

# Set the AWS S3 bucket name and the local file to upload
bucket_name="mybucet01"
local_file="/Users/shakhzod/Desktop/nodejs"

# Use the AWS CLI to upload the file to the S3 bucket
aws s3 cp "$local_file" "s3://$bucket_name/"
