#!.bin/bash
echo "hello shaxzod1"
echo "$PRIVATE_KEY" > private_key && chmod 600 private_key
#1 serverba ula mishun "ssh " connect shudan darkor 
ssh -o StrictHostKeyChecking=no -i private_key ec2-user@ec2-16-171-181-50.eu-north-1.compute.amazonaws.com <<EOF
cd shaxzod/api
pwd
sudo su 
git pull 
whoami
which npm 
npm install 
pm2 restart all
exit  

EOF