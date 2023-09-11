#!.bin/bash



ssh -i "/Users/shakhzod/Desktop/mac.pem" ec2-user@ec2-13-53-170-229.eu-north-1.compute.amazonaws.com <<EOF

#sudo su 
curl -sL https://rpm.nodesource.com/setup_10.x | sudo bash -
#sudo yum 
install nodejs -y
 
npm pakeji nav boshad "npm i" usftanofka kadan darkor

npm i -g pm2 

EOF
