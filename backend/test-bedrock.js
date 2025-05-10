const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

async function testBedrock() {
  try {
    console.log('Creating Bedrock client...');
    const bedrockClient = new BedrockRuntimeClient({
      region: 'us-east-1'
    });
    
    console.log('Client created successfully');
    
    // Simple test prompt
    const prompt = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Hello, can you tell me about FIFA players?"
            }
          ]
        }
      ]
    };
    
    console.log('Sending request to Claude...');
    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(prompt)
    });
    
    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    console.log('Response received:');
    console.log(responseBody.content[0].text);
  } catch (error) {
    console.error('Error:', error);
  }
}

testBedrock();
