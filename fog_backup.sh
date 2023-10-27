#!/bin/bash

# Configuration
regions=("us-east-1")
aws_access_key_id=""
aws_secret_access_key=""
backup_tag="ec2backup"
snapshots_to_remove=()
emailto="vmartin@devicebits.com"

# Logger function
log() {
  echo "$(date +"%Y-%m-%d %H:%M:%S") - $1"
}

# Send error email function
send_error() {
  subject_var="Cannot do backups due to error: $1"
  message_var="Cannot do backups due to error: $1"$'\n'"$2"
  sendmail -t <<EOM
Subject: $subject_var
To: $emailto

$message_var
EOM
}

# AWS CLI Configuration
export AWS_ACCESS_KEY_ID="$aws_access_key_id"
export AWS_SECRET_ACCESS_KEY="$aws_secret_access_key"
export AWS_DEFAULT_REGION="us-east-1"

# SES Configuration
export AWS_DEFAULT_REGION="us-east-1"

# Get current date
current_date=$(date +"%Y-%m-%d")

# Loop through regions
for region_name in "${regions[@]}"; do
  log "Connecting to AWS region $region_name..."
  export AWS_DEFAULT_REGION="$region_name"
  
  # Get a list of instances
  instances_response=$(aws ec2 describe-instances)
  instance_ids=($(echo "$instances_response" | jq -r '.Reservations[].Instances[].InstanceId'))
  
  for instance_id in "${instance_ids[@]}"; do
    ami_id=""
    
    # Check if instance has the backup tag and is running
    instance_tags=$(aws ec2 describe-tags --filters "Name=resource-id,Values=$instance_id")
    backup_tag_value=$(echo "$instance_tags" | jq -r '.Tags[] | select(.Key == "ec2backup") | .Value')
    instance_state=$(aws ec2 describe-instances --instance-ids "$instance_id" | jq -r '.Reservations[].Instances[].State.Name')
    
    if [[ ! -z "$backup_tag_value" && "$backup_tag_value" != "0" && "$instance_state" == "running" ]]; then
      number_of_images=$((backup_tag_value - 1))
      instance_name=$(aws ec2 describe-tags --filters "Name=resource-id,Values=$instance_id" "Name=key,Values=Name" | jq -r '.Tags[].Value')
      
      if [ -z "$instance_name" ]; then
        instance_name="$instance_id"
      fi
      
      ami_name="$instance_name/$current_date"
      groups=($(aws ec2 describe-instances --instance-ids "$instance_id" | jq -r '.Reservations[].Instances[].SecurityGroups[].GroupName'))
      ami_description="BackupTag: $backup_tag; AZ: $(aws ec2 describe-instances --instance-ids "$instance_id" | jq -r '.Reservations[].Instances[].Placement.AvailabilityZone'); TYPE: $(aws ec2 describe-instances --instance-ids "$instance_id" | jq -r '.Reservations[].Instances[].InstanceType'); KEY: $(aws ec2 describe-instances --instance-ids "$instance_id" | jq -r '.Reservations[].Instances[].KeyName'); GROUPS: ${groups[*]}"
      
      log "Creating AMI for $instance_name..."
      ami_id=$(aws ec2 create-image --instance-id "$instance_id" --name "$ami_name" --description "$ami_description" --no-reboot | jq -r '.ImageId')
      
      if [ ! -z "$ami_id" ]; then
        log "AMI $ami_name done. ID: $ami_id"
        
        # Get a list of AMIs created by this script
        images_response=$(aws ec2 describe-images --owners self)
        images=($(echo "$images_response" | jq -r '.Images[] | select(.Name | startswith("'"$instance_name"'/'"$current_date"'" and .Description | startswith("BackupTag: '"$backup_tag"'")) | .ImageId'))
        images_date=($(echo "$images_response" | jq -r '.Images[] | select(.Name | startswith("'"$instance_name"'")) | .Name | split("/") | .[1]'))
        images_date=($(echo "${images_date[@]}" | tr ' ' '\n' | sort -u))
        images_date=($(comm -23 <(printf "%s\n" "${images_date[@]}") <(printf "%s\n" "$current_date")))
        
        log "Old AMIs of instance $instance_name: ${images_date[*]}"
        number_of_images_to_remove=$(( ${#images_date[@]} - number_of_images ))
        
        if [ $number_of_images_remove -gt 0 ]; then
          log "$number_of_images_remove AMIs should be removed."
          
          for image_id in "${images[@]}"; do
            image_name=$(aws ec2 describe-images --image-ids "$image_id" | jq -r '.Images[].Name')
            image_description=$(aws ec2 describe-images --image-ids "$image_id" | jq -r '.Images[].Description')
            
            if [[ "$image_name" == "$instance_name/$current_date"* && "$image_description" == "BackupTag: $backup_tag"* ]]; then
              log "Deregistering AMI $image_name. ID: $image_id"
              aws ec2 deregister-image --image-id "$image_id"
              
              for snapshot_id in $(aws ec2 describe-images --image-ids "$image_id" | jq -r '.Images[].BlockDeviceMappings[].Ebs.SnapshotId'); do
                log "Snapshot of AMI $image_id will be removed by cleanup. ID: $snapshot_id"
                snapshots_to_remove+=("$snapshot_id")
              done
            fi
          done
        fi
      fi
    fi
  done
done

# Snapshot cleanup
log "Snapshot cleanup started."

for snapshot_id in "${snapshots_to_remove[@]}"; do
  if aws ec2 delete-snapshot --snapshot-id "$snapshot_id"; then
    log "Snapshot $snapshot_id removed."
  else
    log "Can't remove the snapshot $snapshot_id."
  fi
done
