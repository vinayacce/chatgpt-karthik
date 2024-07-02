var express = require('express');
var router = express.Router();
var OpenAI = require('openai');
var fs = require('fs');
// import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: 'sk-my-service-account1-ZExtGk1fe8QmhI4hzAzRT3BlbkFJRdH3Vu3ut0PWfZd9nMFH'
});

// Create assistant
router.post('/assistant', async function (req, res, next) {
    try {
        var assistant = await openai.beta.assistants.create({
            name: "Test Assistant",
            instructions: "You are an expert assistant.",
            model: "gpt-3.5-turbo",
            tools: [{ type: "file_search" }],
        });

        res.json({
            "assistant": assistant
        });
    } catch (err) {
        console.error(err);
        next(err);
    }

});

router.post('/uploadFiles', async function (req, res, next) {
    try {
        const fileStreams = [
            "files/Doc1.pdf",
            "files/Doc2.pdf",
            "files/Doc3.pdf",
            "files/Doc4.pdf",
            "files/Doc5.pdf"
        ].map((path) =>
            fs.createReadStream(path),
        );

        // Create a vector store including our two files.
        let vectorStore = openai.beta.vectorStores.create({
            name: "Spiritual Documents",
        });

        await openai.beta.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, fileStreams)

        await openai.beta.assistants.update(req.body.assistant.id, {
            tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
        });

        res.json({
            "vectorStore": vectorStore
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/query', async function (req, res, next) {
    try {
        console.log("Initiate thread");
        const thread = await openai.beta.threads.create({
            messages: [
                {
                    role: "user",
                    content:
                        req.body.query,
                    // Attach the new file to the message.
                    // attachments: [
                    //     { file_id: "file-WPeWzAskyi8YCdH2BDwg1sSZ", tools: [{ type: "file_search" }] },
                    //     { file_id:  "file-ASXgm1yiQx5hnDW4ZJ8HwQoI", tools: [{ type: "file_search" }] },
                    //     { file_id:  "file-TonTImUlDOj5uxuwTXfWaTPC", tools: [{ type: "file_search" }] },
                    //     { file_id:  "file-lweAyX9YxIODFJOIl4DYhrmj", tools: [{ type: "file_search" }] },
                    //     { file_id:  "file-ozMvY5ZD7cbe9x10PuidB5bt", tools: [{ type: "file_search" }] }
                    // ],
                },
            ],
        });
        console.log("Thread creation completed thread id " + thread.id);

        // The thread now has a vector store in its tool resources.
        console.log(thread.tool_resources?.file_search);

        console.log("Initiate run with thread " + thread.id + " assistant " + req.body.assistantId);
        const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
            assistant_id: req.body.assistantId,
        });
        console.log("Completed creating run " + run.id);

        console.log("Retrieve messages from thread " + thread.id + " and run " + run.id);
        const messages = await openai.beta.threads.messages.list(thread.id, {
            run_id: run.id,
        });
        console.log("Received messages " + messages);

        // let response = "{\"options\":{\"method\":\"get\",\"path\":\"/threads/thread_d3pMzzq6QvJLL2QDKqKc6ob4/messages\",\"query\":{\"run_id\":\"run_4UGtkPd8zUVhkRbfwmmneJtC\"},\"headers\":{\"OpenAI-Beta\":\"assistants=v2\"}},\"response\":{\"size\":0,\"timeout\":0},\"body\":{\"object\":\"list\",\"data\":[{\"id\":\"msg_xYKASOAQIbZ8Ctn9fVIwAidP\",\"object\":\"thread.message\",\"created_at\":1719808535,\"assistant_id\":\"asst_IQ5HvMSgd9VEiJ1kzFEGffF3\",\"thread_id\":\"thread_d3pMzzq6QvJLL2QDKqKc6ob4\",\"run_id\":\"run_4UGtkPd8zUVhkRbfwmmneJtC\",\"role\":\"assistant\",\"content\":[{\"type\":\"text\",\"text\":{\"value\":\"The Spiritual Exercises of St. Ignatius of Loyola are deeply introspective practices that invite individuals to become disciples of truth and listen to the Holy Word. These exercises involve meditation and contemplation on the mysteries of the life of Christ, aiming to free the contemplative from any obstacles like sins or disorderly existence. The exercises serve as a spiritual competition to conquer oneself, regulate life, and strive to love and serve the Divine Majesty in all ways through a methodical and personal effort guided by divine grace【4:0†source】.\\n\\nSt. Ignatius' Spiritual Exercises are designed to assist individuals in finding God's will for their life and give them the motivation and courage to follow that will. They are organized into four \\\"weeks,\\\" with each week focusing on a different theme: human sin, Christ's life on earth, Christ's death on the cross, and Christ's risen life. Throughout the exercises, discernment plays a key role in distinguishing between good and evil desires in one's life to realize God's will. These exercises are most beneficial when practiced faithfully and can be extremely valuable for personal study, although having a spiritual director can enhance the experience【4:1†source】.\",\"annotations\":[{\"type\":\"file_citation\",\"text\":\"【4:0†source】\",\"start_index\":552,\"end_index\":564,\"file_citation\":{\"file_id\":\"file-SYjg8pUHb5curUsEfdUzNJSy\"}},{\"type\":\"file_citation\",\"text\":\"【4:1†source】\",\"start_index\":1223,\"end_index\":1235,\"file_citation\":{\"file_id\":\"file-skTlHmMUvXHE57DH4aw7JJXR\"}}]}}],\"attachments\":[],\"metadata\":{}}],\"first_id\":\"msg_xYKASOAQIbZ8Ctn9fVIwAidP\",\"last_id\":\"msg_xYKASOAQIbZ8Ctn9fVIwAidP\",\"has_more\":false},\"data\":[{\"id\":\"msg_xYKASOAQIbZ8Ctn9fVIwAidP\",\"object\":\"thread.message\",\"created_at\":1719808535,\"assistant_id\":\"asst_IQ5HvMSgd9VEiJ1kzFEGffF3\",\"thread_id\":\"thread_d3pMzzq6QvJLL2QDKqKc6ob4\",\"run_id\":\"run_4UGtkPd8zUVhkRbfwmmneJtC\",\"role\":\"assistant\",\"content\":[{\"type\":\"text\",\"text\":{\"value\":\"The Spiritual Exercises of St. Ignatius of Loyola are deeply introspective practices that invite individuals to become disciples of truth and listen to the Holy Word. These exercises involve meditation and contemplation on the mysteries of the life of Christ, aiming to free the contemplative from any obstacles like sins or disorderly existence. The exercises serve as a spiritual competition to conquer oneself, regulate life, and strive to love and serve the Divine Majesty in all ways through a methodical and personal effort guided by divine grace【4:0†source】.\\n\\nSt. Ignatius' Spiritual Exercises are designed to assist individuals in finding God's will for their life and give them the motivation and courage to follow that will. They are organized into four \\\"weeks,\\\" with each week focusing on a different theme: human sin, Christ's life on earth, Christ's death on the cross, and Christ's risen life. Throughout the exercises, discernment plays a key role in distinguishing between good and evil desires in one's life to realize God's will. These exercises are most beneficial when practiced faithfully and can be extremely valuable for personal study, although having a spiritual director can enhance the experience【4:1†source】.\",\"annotations\":[{\"type\":\"file_citation\",\"text\":\"【4:0†source】\",\"start_index\":552,\"end_index\":564,\"file_citation\":{\"file_id\":\"file-SYjg8pUHb5curUsEfdUzNJSy\"}},{\"type\":\"file_citation\",\"text\":\"【4:1†source】\",\"start_index\":1223,\"end_index\":1235,\"file_citation\":{\"file_id\":\"file-skTlHmMUvXHE57DH4aw7JJXR\"}}]}}],\"attachments\":[],\"metadata\":{}}]}";

        // let messages = JSON.parse(response);

        const message = messages.data.pop();
        let textResponse = '';
        let citationsResponse = "";
        if (message.content[0].type === "text") {
            const { text } = message.content[0];
            const { annotations } = text;
            const citations = [];

            let index = 0;
            for (let annotation of annotations) {
                text.value = text.value.replace(annotation.text, "[" + index + "]");
                const { file_citation } = annotation;
                if (file_citation) {
                    console.log("Initiate file details request file id " + file_citation.file_id);
                    const citedFile = await openai.files.retrieve(file_citation.file_id);
                    console.log("Received citation file details " + citedFile.id);
                    citations.push("[" + index + "]" + citedFile.filename);
                }
                index++;
            }

            console.log(text.value);
            textResponse += text.value;
            console.log(citations.join("\n"));
            citationsResponse += citations.join("\n");
        }

        res.json({
            'text': textResponse,
            'citations': citationsResponse
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.get('/', function(req, res, next) {
    res.render('chatgptindex', { title: 'Spiritual Exercises of St. Ignatius Loyola' });
});

module.exports = router;
