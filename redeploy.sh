#!.bin/bash


echo "hello shaxzod1"

echo "$PRIVATE_KEY" > private_key && chmod 600 private_key

#1 serverba ula mishun "ssh " connect shudan darkor 
ssh -o StrictHostKeyChecking=no -i private_key ec2-user@ec2-16-171-181-50.eu-north-1.compute.amazonaws.com <<EOF


# fileba daromadan darkor 
cd shaxzod/api
pwd
sudo su 
git pull 
whoami
#curl -sL https://rpm.nodesource.com/setup_10.x | sudo bash -
#sudo yum install nodejs -y
#2 githubba deploy shudagi file "pull" mukunam 
which npm 
# npm pakeji nav boshad "npm i" usftanofka kadan darkor 
npm install 
#3 badi "pull" shudagesh Pm2 restart mukunam
#npm i -g pm2 
 pm2 restart all
 sleep 5
 pm2 logs  

#4 soni "pm2 ps " kada narmalni kor kaysasmi nemi tekshiri mukunam 
EOF
