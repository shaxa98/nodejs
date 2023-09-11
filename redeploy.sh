#!.bin/bash

#1 serverba ula mishun "ssh " connect shudan darkor 
ssh -o StrictHostKeyChecking=no -i private_key ec2-user@ec2-13-53-170-229.eu-north-1.compute.amazonaws.com <<EOF
cd api

git pull 
npm install 
pm2 restart all
exit  

EOF