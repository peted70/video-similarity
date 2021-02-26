# Video Similarity Sample

![Postman](./images/postman.png)

This sample represents a node.js application running in an Azure Function. The code will accept an HTTP POST with the body set as follows:

```json
{
    "videourl": "https://contentsimilaritystorage.blob.core.windows.net/input/Big_Buck_Bunny_1080_10s_30MB.mp4",
    "hashbits": 8,
    "strength": 1
}
```

The url must be pointing to a publicly accessible video file. The `hashbits` and `strength` parameters are optional and represent parameters to the perceptual hashing library. Then, if the function is successful the response will contain a value representing the perceptual hash for the file. 'Similar' videos will return the same value.

```curl
curl --location --request POST 'https://contentsimilarity.azurewebsites.net/api/HttpTrigger' \
--header 'Content-Type: application/json' \
--data-raw '{
    "videourl": "https://contentsimilaritystorage.blob.core.windows.net/input/Big_Buck_Bunny_1080_10s_30MB.mp4",
    "hashbits": 8,
    "strength": 1
}'
```

## Deployment

Using Visual Studio Code with the [Azure Functions Tools Extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions) installed you can use the shortcut CTRL+SHIFT+P and start typing `Azure Functions...` and find `Azure Functions: Deploy to Function App...`. This will start a wizard which will lead you through the process of creating a Function App or installing into one if you have one already.

> During this process you will be prompted to create a storage account as that is needed by the function and you could upload a video file to that storage to use to test the function.
