# HyperDev persistence demo using DynamoDB

This project demonstrates how to use the basic key-value store provided with all HyperDev containers through the config file:

  `var CONFIG_FILE = "./.hyperweb_aws_credentials.json";`

It looks sort of like this:

{
  "hyperWebId": "[unique id]",
  "accessKeyId": "[redacted]",
  "secretAccessKey": "[redacted]",
  "sessionToken": "[redacted]",
  "expiration": "[valid for 1 hour at a time]",
  "dynamodbKeyValueTable": "hyperweb-key-store",
  "region": "us-east-1"
}

When accessing the key value store the `hyperWebId` value must always be
provided in the `hyperweb_id` attribute to access the containers data in
the `dynamodbKeyValueTable` table. This is performed for you transparently
by datastore.js.

The credentials are container-specific and automatically refreshed.

If you want to be able to create tables, avoid rate limits, or use functionality other than what is provided by the exports from datastore.js, you'll need your own credentials.Stick them in .env and use them instead.

There's a [walk-through blog post](https://hyperdev.com/blog/dynamodb-hyperdev-persistence-state-database/) available that guides you through the code in this project.

For more HyperDev examples, check out the [Gallery](https://hyperdev.com/community/)