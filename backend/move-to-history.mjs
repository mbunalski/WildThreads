import { S3Client, ListObjectsV2Command, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: "us-east-1" });
const BUCKET_NAME = "wildthreads";

export const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event));

  // HTTP API v2 uses requestContext.http.method instead of httpMethod
  const method = event.requestContext?.http?.method || event.httpMethod;

  if (method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS, POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { items, action = 'move', folder = 'Available' } = body; // Array of directory names, action type, and source folder

    if (!items || !Array.isArray(items) || items.length === 0) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Items array is required" }),
      };
    }

    console.log(`Action: ${action}, Folder: ${folder}, Processing ${items.length} items`);

    const results = [];

    for (const itemDirectory of items) {
      try {
        const sourcePrefix = `${folder}/${itemDirectory}/`;
        const destPrefix = `History/${itemDirectory}/`;

        console.log(`Processing: ${itemDirectory}`);

        // List all files in the source directory
        const listCommand = new ListObjectsV2Command({
          Bucket: BUCKET_NAME,
          Prefix: sourcePrefix,
        });

        const listResponse = await s3.send(listCommand);
        const files = listResponse.Contents || [];

        if (files.length === 0) {
          console.log(`No files found for ${itemDirectory}`);
          results.push({ item: itemDirectory, status: "skipped", reason: "No files found" });
          continue;
        }

        console.log(`Found ${files.length} files for ${itemDirectory}`);

        if (action === 'move') {
          // Copy each file to History, then delete from Available
          for (const file of files) {
            const sourceKey = file.Key;
            const fileName = sourceKey.replace(sourcePrefix, '');
            const destKey = `${destPrefix}${fileName}`;

            console.log(`Copying ${sourceKey} to ${destKey}`);

            // Copy the file
            const copyCommand = new CopyObjectCommand({
              Bucket: BUCKET_NAME,
              CopySource: `${BUCKET_NAME}/${sourceKey}`,
              Key: destKey,
            });

            await s3.send(copyCommand);

            // Delete the original file
            const deleteCommand = new DeleteObjectCommand({
              Bucket: BUCKET_NAME,
              Key: sourceKey,
            });

            await s3.send(deleteCommand);
          }

          console.log(`Successfully moved ${itemDirectory} to History`);
          results.push({ item: itemDirectory, status: "success", action: "moved", filesCount: files.length });

        } else if (action === 'delete') {
          // Delete files from Available only (no copy)
          for (const file of files) {
            const sourceKey = file.Key;
            console.log(`Deleting ${sourceKey}`);

            const deleteCommand = new DeleteObjectCommand({
              Bucket: BUCKET_NAME,
              Key: sourceKey,
            });

            await s3.send(deleteCommand);
          }

          console.log(`Successfully deleted ${itemDirectory}`);
          results.push({ item: itemDirectory, status: "success", action: "deleted", filesCount: files.length });
        }

      } catch (itemError) {
        console.error(`Error moving ${itemDirectory}:`, itemError);
        results.push({ item: itemDirectory, status: "failed", error: itemError.message });
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS, POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({
        message: "Move operation completed",
        results: results,
      }),
    };

  } catch (err) {
    console.error("Error:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
