#!.bin/bash

echo "$PRIVATE_KEY" > private_key && chmod 600 private_key
#1 serverba ula mishun "ssh " connect shudan darkor 
ssh -o StrictHostKeyChecking=no -i private_key ec2-user@13.53.170.229 <<EOF
cd api
git pull 
npm install 
pm2 restart all
exit  

EOF