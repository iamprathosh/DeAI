import { sendNetworkMessage } from './decentralizedNetwork';
import { addToIPFS, getFromIPFS, updateContentMetadata } from './ipfsStorage';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, ChatSession } from "@google/generative-ai";

// Simulate basic language model capabilities
// ...existing code...
// Global chat history for DeAI (Gemini simulation)
// let deaiChatHistory: DeAIMessage[] = []; // Commented out as history will be managed by ChatSession

// Initialize the Gemini Pro API client and model
// IMPORTANT: Replace "GEMINI_API_KEY" with your actual API key
const API_KEY = "AIzaSyB1IaB8GhhR5hawGO0XIj1o0fO2yFiMr8A"; 
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 

let deaiChatSession: ChatSession | null = null;

const getDeAIChatSession = (): ChatSession => {
  if (!deaiChatSession) {
    deaiChatSession = model.startChat({
      history: [], 
      generationConfig: {
        maxOutputTokens: 200, 
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });
  }
  return deaiChatSession;
};

// Simulates sending a message to Gemini and getting a response, considering history. - Old simulation code removed for brevity

export const processDeAIQuery = async (query: string): Promise<{
  response: string;
  responseCid: string;
  processingPath: string[];
}> => {
  console.log('Processing DeAI query with actual Gemini API:', query);
  
  const chat = getDeAIChatSession();
  let aiResponseText = "Sorry, I couldn't get a response from DeAI.";

  try {
    const result = await chat.sendMessage(query);
    const response = result.response;
    aiResponseText = response.text();

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        aiResponseText = `Error communicating with DeAI: ${error.message}`;
    }
    deaiChatSession = null; 
  }

  const queryCidPayload = { type: 'query-deai-gemini-api', timestamp: Date.now(), queryText: query };
  const queryCid = await addToIPFS(JSON.stringify(queryCidPayload));

  const processingPath = ['user-device', 'gemini-api-service', 'user-device'];

  const responseCidPayload = {
    type: 'response-deai-gemini-api',
    queryCid,
    timestamp: Date.now(),
    responseText: aiResponseText,
    processingPathUsed: processingPath.join('->')
  };
  const responseCid = await addToIPFS(JSON.stringify(responseCidPayload));

  await updateContentMetadata(queryCid, {
    responseCid,
    processed: true,
    status: 'DeAIProcessedWithGeminiAPI',
    timestamp: Date.now()
  });

  console.log('DeAI (Gemini API) Response stored with CID:', responseCid);

  return {
    response: aiResponseText,
    responseCid,
    processingPath,
  };
};

export const resetDeAIChatHistory = () => {
  if (deaiChatSession) {
    deaiChatSession = null; 
  }
  console.log("DeAI (Gemini API) chat session has been reset.");
};