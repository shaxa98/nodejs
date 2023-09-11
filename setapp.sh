#!.bin/bash

echo "$PRIVATE_KEY" > private_key && chmod 600 private_key
#1 serverba ula mishun "ssh " connect shudan darkor 
ssh -o StrictHostKeyChecking=no -i private_key ec2-user@ec2-16-171-181-50.eu-north-1.compute.amazonaws.com <<EOF

sudo su 
curl -sL https://rpm.nodesource.com/setup_10.x | sudo bash -
sudo yum install nodejs -y
 githubba deploy shudagi file "pull" mukunam 
npm pakeji nav boshad "npm i" usftanofka kadan darkor
3 badi "pull" shudagesh Pm2 restart mukunam
npm i -g pm2 

EOF