require("dotenv").config();
import express from "express";
//import Anthropic from "@anthropic-ai/sdk";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import { ContentBlock, TextBlock } from "@anthropic-ai/sdk/resources";
import {basePrompt as nodeBasePrompt} from "./defaults/node";
import {basePrompt as reactBasePrompt} from "./defaults/react";
import cors from "cors";


import OpenAI from "openai";

// Initialize OpenAI SDK for DeepSeek API
const openai  = new OpenAI({
    baseURL: "https://api.deepseek.com", //process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1",
    apiKey: "sk-a1f395bb870c4d7996841f5ac086faba",  // process.env.DEEPSEEK_API_KEY,
});

//const anthropic = new Anthropic();

//const anthropic = deepseek;
const app = express();
app.use(cors())
app.use(express.json())

app.post("/template", async (req, res) => {
    const prompt = req.body.prompt;
    
    const response = await openai.chat.completions.create({
        messages: [{role: 'system', content:  " Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra"}, {
            role: 'user', content: prompt 
        }],
        model: 'deepseek-chat',
        max_tokens: 200,
       // system: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra"
    })

    const answer = (response.choices[0].message.content ) // react or node
    if (answer == "react") {
        res.json({
            prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [reactBasePrompt]
        })
        return;
    }

    if (answer === "node") {
        res.json({
            prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [nodeBasePrompt]
        })
        return;
    }

    res.status(403).json({message: "You cant access this"})
    return;

})

app.post("/chat", async (req, res) => {
    const messages = req.body.messages;
    const response = await openai.chat.completions.create({
       
       
        messages: messages,
       // model: 'claude-3-5-sonnet-20241022',
       model: 'deepseek-chat', 
       max_tokens: 8000,
        //system: getSystemPrompt()
    })


    
    console.log(response);

    res.json({
        response: (response.choices[0].message.content )
    });
})

app.listen(3000);

