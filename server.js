let express = require("express");
let path = require("path");
let app = express();
let server = require("http").Server(app);
let io = require("socket.io")(server);
let port = 8080;
let languageObj = require("./languageCode.js");
let tran = "";
const fs = require("fs");
var randomstring = require("randomstring");
const projectId = "green-post-324807";
const keyFilename = "C:\\Users\\dell\\OneDrive\\Documents\\GitHub\\Translation-Website\\green-post-324807-879dd34e7a59.json";
// Imports the Google Cloud client library
const textToSpeech = require("@google-cloud/text-to-speech");
// Creates a client
const client = new textToSpeech.TextToSpeechClient({ projectId, keyFilename });
// Imports the Google Cloud client library
const { Translate } = require('@google-cloud/translate').v2;
const translate = new Translate({ projectId, keyFilename });

app.use("/", express.static(path.join(__dirname, "dist/TranslateApp")));
app.use("/exports", express.static(path.join(__dirname, "exports")));

io.on("connection", socket => {
    console.log("new connection made from client with ID=" + socket.id);

    io.sockets.emit("lcodesMsg", languageObj); //emits the codes of languages

    socket.on("translateRequest", data => {
        quickStart(data.message, data.language); //call the translation method

        console.log("translateRequest received at server", data);
        // Construct the request
        const request = {
            input: { text: data.message },
            // Select the language and SSML Voice Gender (optional)
            voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
            // Select the type of audio encoding
            audioConfig: { audioEncoding: "MP3" },
        };

        // Performs the Text-to-Speech request
        client.synthesizeSpeech(request, (err, response) => {
            if (err) {
                console.error("ERROR:", err);
                return;
            }

            var outputName = `exports/output${randomstring.generate()}.mp3`;
            // Write the binary audio content to a local file
            fs.writeFile(outputName, response.audioContent, "binary", err => {
                if (err) {
                    console.error("ERROR:", err);
                    return;
                }

                io.sockets.emit("result", { msg: data.message, fileOutputName: outputName, translated: tran });
                console.log("Audio content written to file:" + outputName);
            });
        });

    });
});


async function quickStart(message, language) {
    // Translates some text into the language selected by the user 
    const [translation] = await translate.translate(message, language);
    console.log(`Text: ${message}`);
    console.log(`Translation: ${translation}`);
    tran = translation;

    return tran;
}

server.listen(port, () => {
    console.log("Listening on port " + port);
});
