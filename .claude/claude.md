# WildThreads Project Notes

## Lambda Function Deployment Guide

### Important: HTTP API v2 Event Structure

When using AWS API Gateway HTTP API v2 (not REST API), the Lambda event structure is different:

```javascript
// HTTP API v2 uses:
const method = event.requestContext?.http?.method

// NOT:
const method = event.httpMethod
```

### CORS Configuration for HTTP API v2

1. **API Gateway CORS Settings:**
```bash
aws apigatewayv2 update-api \
  --api-id <API_ID> \
  --cors-configuration AllowOrigins='*',AllowMethods='POST,OPTIONS',AllowHeaders='Content-Type,Authorization',ExposeHeaders='*',MaxAge=300 \
  --region us-east-1
```

2. **Lambda Response Format:**
Lambda must return headers in this format:
```javascript
return {
  statusCode: 200,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS, POST",
    "Access-Control-Allow-Headers": "Content-Type",
  },
  body: JSON.stringify({ ... }),
};
```

### Current Lambda Functions

#### move-to-history
- **Function Name:** `move-to-history`
- **Runtime:** nodejs18.x
- **Handler:** move-to-history.handler
- **API Gateway:** `https://d7rjek31n0.execute-api.us-east-1.amazonaws.com/`
- **Role:** `arn:aws:iam::637423223666:role/service-role/imageupload-role-9tfgwyak`

**Actions:**
- `action: "move"` - Copies items from Available/ to History/, then deletes from Available/
- `action: "delete"` - Deletes items from Available/ only (no copy)

**Deployment:**
```bash
cd backend
zip -q -r move-to-history.zip move-to-history.mjs node_modules package.json
aws lambda update-function-code \
  --function-name move-to-history \
  --zip-file fileb://move-to-history.zip \
  --region us-east-1
rm move-to-history.zip
```

### API Gateway Permission

Grant API Gateway permission to invoke Lambda:
```bash
aws lambda add-permission \
  --function-name move-to-history \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:us-east-1:637423223666:<API_ID>/*" \
  --region us-east-1
```

### Testing CORS

Test OPTIONS preflight:
```bash
curl -X OPTIONS "https://d7rjek31n0.execute-api.us-east-1.amazonaws.com/" \
  -H "Origin: http://localhost:3001" \
  -H "Access-Control-Request-Method: POST" \
  -i
```

Should return 200 with CORS headers.

### Common Issues

1. **500 on OPTIONS request:** Lambda not handling HTTP API v2 event format correctly
2. **Missing CORS headers:** API Gateway CORS not configured properly
3. **CORS preflight failed:** Lambda function returning error for OPTIONS requests

### Other Services

**Existing Lambda Functions:**
- `imageupload` - Handles single file uploads to S3
- `getdirectories` - Lists directories in S3 Available/ or History/ folders

**API Endpoints:**
- Upload: `https://fpvemqdbve.execute-api.us-east-1.amazonaws.com/test`
- Get Directories: `https://tn5znlmkek.execute-api.us-east-1.amazonaws.com/test/`

**S3 Bucket:** `wildthreads`
- `Available/` - Current inventory
- `History/` - Sold items
