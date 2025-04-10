export const getGeminiData = async (): Promise<string> => {
  // Simulate fetching data from Gemini
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("Gemini data loaded successfully.");
    }, 1000);
  });
};

export const connectToGemini = async (): Promise<void> => {
  // Simulate connecting to Gemini
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
};

export const disconnectFromGemini = async (): Promise<void> => {
  // Simulate disconnecting from Gemini
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
};
