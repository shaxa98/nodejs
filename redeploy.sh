#!.bin/bash

echo "$PRIVATE_KEY" > private_key && chmod 600 private_key
#1 serverba ula mishun "ssh " connect shudan darkor 
ssh -o StrictHostKeyChecking=no -i private_key $USER@$HOST <<EOF
cd nodejs
git pull 
npm install 
pm2 restart all
curl --location 'http://13.53.170.229:2500/health'
exit  
EOF
