const AWS = require("aws-sdk");
const EC2 = new AWS.EC2({ region: "us-east-1" });
const SES = new AWS.SES({ region: "us-east-1" });
const fs = require("fs");
const util = require("util");
const cron = require("node-cron");

const regions = ["us-east-1"];
const awsAccessKeyId = "";
const awsSecretAccessKey = "";
const backupTag = "ec2backup";
const snapshotsToRemove = [];
const emailTo = "vmartin@devicebits.com";

const logFile = fs.createWriteStream("log.txt", { flags: "a" });
const logger = new console.Console(logFile, logFile);

const sesConnect = () => {
  try {
    logger.info("Connecting to AWS SES...");
    AWS.config.credentials = new AWS.EC2MetadataCredentials();
  } catch (error) {
    logger.error(
      `Cannot connect to AWS SES due to error: ${error.message}\n${error.stack}`
    );
    process.exit(1);
  }
};

const sendErrorEmail = async (mailFrom, mailTo, subject, messageData) => {
  try {
    await sesConnect();
    await SES.sendEmail({
      Destination: {
        ToAddresses: [mailTo],
      },
      Message: {
        Body: {
          Text: {
            Charset: "UTF-8",
            Data: messageData,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: subject,
        },
      },
      Source: mailFrom,
    }).promise();
  } catch (error) {
    logger.error(
      `Cannot send email due to error: ${error.message}\n${error.stack}`
    );
    process.exit(1);
  }
};

const sendError = () => {
  sendErrorEmail("no-reply@devicebits.com", emailTo, subjectVar, messageVar);
};

const awsConnect = (region) => {
  try {
    logger.info("Connecting to AWS...");
    AWS.config.credentials = new AWS.EC2MetadataCredentials();
  } catch (error) {
    logger.error(`Cannot connect to AWS due to error: ${error.stack}`);
    process.exit(1);
  }
};

const current_date = new Date().toISOString().slice(0, 10);

const task = cron.schedule("0 0 * * *", () => {
  regions.forEach(async (regionName) => {
    awsConnect(regionName);
    try {
      const instancesResponse = await EC2.describeInstances().promise();
      instancesResponse.Reservations.forEach(async (reservation) => {
        const instance = reservation.Instances[0];
        const amiId = {};

        if (
          instance.Tags.some(
            (tag) => tag.Key === backupTag && parseInt(tag.Value) !== 0
          ) &&
          instance.State.Name === "running"
        ) {
          const numberOfImages =
            parseInt(instance.Tags.find((tag) => tag.Key === backupTag).Value) -
            1;
          const instanceName =
            instance.Tags.find((tag) => tag.Key === "Name")?.Value ||
            instance.InstanceId;
          const amiName = `${instanceName}/${current_date}`;
          const groups = instance.SecurityGroups.map(
            (group) => group.GroupName
          );
          const amiDescription = `${backupTag}; AZ:${
            instance.Placement.AvailabilityZone
          }; TYPE:${instance.InstanceType}; KEY:${
            instance.KeyName
          }; GROUPS:${groups.join(",")}`;

          logger.info(`Creating AMI for ${instanceName}.`);
          const result = await EC2.createImage({
            InstanceId: instance.InstanceId,
            Name: amiName,
            Description: amiDescription,
            NoReboot: true,
          }).promise();

          if (result.ImageId) {
            logger.info(`AMI ${amiName} done. ID: ${result.ImageId}.`);
            const imagesResponse = await EC2.describeImages({
              Owners: ["self"],
            }).promise();
            const imagesDate = imagesResponse.Images.filter(
              (image) =>
                image.Name.split("/")[0] === instanceName &&
                image.Description.split(";")[0] === backupTag
            )
              .map((image) => image.Name.split("/")[1])
              .sort();
            imagesDate.splice(imagesDate.indexOf(current_date), 1);
            logger.info(`Old AMIs of instance ${instanceName}: ${imagesDate}.`);
            const numberOfImagesToRemove = imagesDate.length - numberOfImages;

            if (numberOfImagesToRemove > 0) {
              logger.info(`${numberOfImagesToRemove} AMIs should be removed.`);
              imagesResponse.Images.forEach(async (image) => {
                if (
                  image.Name.split("/")[0] === instanceName &&
                  image.Description.split(";")[0] === backupTag &&
                  imagesDate
                    .slice(0, numberOfImagesToRemove)
                    .includes(image.Name.split("/")[1])
                ) {
                  if (image.ImageId) {
                    const deregisterResult = await EC2.deregisterImage({
                      ImageId: image.ImageId,
                    }).promise();
                    if (deregisterResult.Return) {
                      logger.info(
                        `AMI ${image.Name} deregistered. ID: ${image.ImageId}.`
                      );
                      image.BlockDeviceMappings.forEach((snapshot) => {
                        if (snapshot.SnapshotId) {
                          logger.info(
                            `Snapshot of AMI ${image.ImageId} will be removed by cleanup. ID: ${snapshot.SnapshotId}.`
                          );
                          snapshotsToRemove.push(snapshot.SnapshotId);
                        }
                      });
                    } else {
                      logger.error(
                        `Can't deregister AMI ${image.Name}. ID: ${image.ImageId}.`
                      );
                    }
                  }
                }
              });
            }
          }
        }
      });
      logger.info("Snapshot cleanup started.");
      for (const snapshot of snapshotsToRemove) {
        const deleteResult = await EC2.deleteSnapshot({
          SnapshotId: snapshot,
        }).promise();
        if (deleteResult.Return) {
          logger.info(`Snapshot ${snapshot} removed.`);
        } else {
          logger.error(`Can't remove the snapshot ${snapshot}.`);
        }
      }
    } catch (error) {
      logger.error(
        `Cannot do backups due to error: ${error.message}\n${error.stack}`
      );
      const subjectVar = `Cannot do backups due to error: ${error.message}`;
      const messageVar = `Cannot do backups due to error: ${error.message}\n${error.stack}`;
      sendError();
      process.exit(1);
    }
  });
});

task.start();
