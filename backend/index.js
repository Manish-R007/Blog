import express from "express";
import { GoogleGenAI } from "@google/genai";
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3000;

app.get('/',(req,res) => {
    return res.send('hello from server');
})

app.post('/askAi', async (req,res) => {
    const prompt = req.body.prompt;
    console.log(prompt);
    try {
    const ai = new GoogleGenAI({ apiKey: 'AIzaSyDFUJ4g6DnkxmckLJL6q-UdQFtdk6GrXaE' });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `
            You are a AI Assistant for our Blogging Project,
            here you will get some title of the Blog post as input and you should give some body for that post which can be be posted in our Blogging Project,
            Also you should give meaningfull, structured and beautifull text so that they become happy. Also If the input not related to the Blogging like solve this code or any other political questions like who is the CM of india , Just give your response as I am not programmed to answer this type of questions else you can also give your own response.
        `
      }
    });
    // console.log(response);
    res.json({
        text: response.text
    });
    } catch (e) {
        console.log(e);
    }
    
})

app.listen(PORT,() => {
    console.log(`Server is running at http://localhost:${PORT}`)
}) 