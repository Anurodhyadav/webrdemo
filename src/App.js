import "./App.css";
import React, { useEffect, useState } from "react";
import { Console, WebR } from "@r-wasm/webr";
import styled from "styled-components";
import Editor from "@monaco-editor/react";
import { FilesAndCodes } from "./constant";
// import Worker from "worker-loader!./webr.worker.js";

const webR = new WebR();
let rnorm;

const webRConsole = new Console({
  canvasExec: (line) => {
    return Function(`
    document.getElementById('plot-canvas').getContext('2d').${line};
`)();
  },

  prompt: () => {},
});

function App() {
  const [result, updateResult] = useState(["Loading webR..."]);

  const [code, setCode] = useState(FilesAndCodes[0].initialCode);
  const [topicIndex, setTopicIndex] = useState(0);
  const [error, setError] = useState("");

  // useEffect(() => {
  //   const worker = new Worker();
  //   // worker.addEventListener("message", ({ data }) => {
  //   //   console.log({ workerMessage: data });
  //   // });

  //   worker.onmessage = (message) => console.log("message");
  // }, []);

  useEffect(() => {
    console.log("THe enviroment name", process.env.NODE_ENV);

    const worker = new Worker(
      new URL("./webr-serviceworker.js", import.meta.url, { type: "module" })
    );
    // worker.postMessage();
    const webWorker = new Worker(
      new URL("./webr-worker.js", import.meta.url, { type: "module" })
    );

    // webWorker.postMessage();
  }, []);

  const evaluateCode = async (code) => {
    try {
      rnorm = await webR.evalR(code);
    } catch (e) {
      setError(e.message);
    }
    return rnorm;
  };

  const handleCodeChange = (code) => {
    setCode(code);
  };

  const runRCode = async () => {
    setError("");

    await webR.init();

    webRConsole.run();
    webRConsole.stdin(code);
    const result = await evaluateCode(code);

    if (result) {
      const output = await result.toArray();
      updateResult(output);
    }
  };

  const handleFileChange = (e, index) => {
    let i;
    updateResult("");
    const codeFile = FilesAndCodes[index].initialCode;
    setTopicIndex(index);
    setCode(codeFile);
    const tablinks = document.getElementsByClassName("tablink");

    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace("highlight", "");
    }
    e.currentTarget.className += "highlight";
  };

  return (
    <div className="App">
      <RHeader>R online Compiler</RHeader>
      <RContainer>
        <CodeandFile>
          <FileandRun>
            <FileNames>
              {FilesAndCodes.map((file, index) => {
                return (
                  <div
                    className={`${index === 0 ? "highlight" : ""} tablink `}
                    onClick={(e) => handleFileChange(e, index)}
                  >
                    {file.fileName}
                  </div>
                );
              })}
            </FileNames>

            <RunButton onClick={runRCode}>Run</RunButton>
          </FileandRun>

          <Editor
            height="80vh"
            width={`100%`}
            language={"R"}
            value={code}
            theme={"Xcode_default"}
            onChange={(e) => handleCodeChange(e)}
          />
        </CodeandFile>

        <ResultSection id="result-container">
          {error ? (
            <p className="error">The Error:{error} </p>
          ) : (
            <p>Output : {result && result?.join(",")}</p>
          )}

          {topicIndex === 4 ? (
            <Canvas id="plot-canvas" width="1000px" height="1000px"></Canvas>
          ) : (
            ""
          )}
        </ResultSection>
      </RContainer>
    </div>
  );
}

const RContainer = styled.div`
  display: flex;
  width: 100%;
  padding: 24px;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const RHeader = styled.div`
  text-align: left;
  font-weight: bold;
  width: 100%;
  padding: 24px 48px;
  border-bottom: 2px solid #d3dce6;
`;

const RunButton = styled.div`
  background-color: #0456f3;
  padding: 8px 24px;
  color: white;
  cursor: pointer;
  &:hover {
    background-color: #1b46c9;
  }
`;

const FileNames = styled.div`
  display: flex;
  gap: 1px;

  cursor: pointer;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const CodeandFile = styled.div`
  flex: 1;
  display: flex;
  gap: 5px;

  flex-direction: column;
`;
const FileandRun = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 0px;
`;

const ResultSection = styled.div`
  flex: 1;
  text-align: left;
  justify-content: flex-start;
  padding: 20px;
  padding-top: 48px;
`;
const Canvas = styled.canvas`
  transform: scale(0.5);
  transform-origin: left top;
  margin-bottom: -150px;
  margin-right: -150px;
`;

export default App;
