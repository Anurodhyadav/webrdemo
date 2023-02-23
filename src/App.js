import "./App.css";
import React, { useState } from "react";
import { Console } from "@r-wasm/webr";
import styled from "styled-components";
import Editor from "@monaco-editor/react";
import { FilesAndCodes } from "./constant";
import { BrowserRouter as Router } from "react-router-dom";

import loader from "./loading.svg";

const loadingText = `Datamentor is loading resources for a seamless coding
experience. You can start typing your code on the left and
unleash your coding superpowers 💪`;

const webRConsole = new Console({
  canvasExec: (line) => {
    return Function(`
  document.getElementById('plot-canvas').getContext('2d').${line};
`)();
  },
  stdout: (line) => {
    const resultContainer = document.getElementById("output");
    if (!resultContainer) return;

    const output = line;

    const lineEle = document.createElement("div");
    lineEle.style.color = "black";
    lineEle.innerText = output;

    resultContainer.appendChild(lineEle);

    const firstChildTextContent = resultContainer.firstChild.textContent;

    if (
      firstChildTextContent.replace(/\s/g, "") ===
      loadingText.replace(/\s/g, "")
    ) {
      resultContainer.removeChild(resultContainer.firstChild);
    }
  },
  stderr: (line) => {
    const resultContainer = document.getElementById("output");
    const errorEle = document.createElement("div");
    errorEle.style.color = "red";
    errorEle.innerHTML = line;
    resultContainer.innerHTML = "";
    resultContainer.appendChild(errorEle);
  },

  prompt: (p) => document.getElementById("output").append(p),
});
webRConsole.run();

function App() {
  const [code, setCode] = useState(FilesAndCodes[0].initialCode);
  const [topicIndex, setTopicIndex] = useState(0);
  const [error, setError] = useState("");

  const handleCodeChange = (code) => {
    setCode(code);
  };

  const runRCode = async () => {
    setError("");

    const resultContainer = document.getElementById("output");
    resultContainer.innerText = "";
    webRConsole.stdin(code);
  };

  const handleFileChange = (e, index) => {
    let i;

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
      <Router basename="/r-programming/playground">
        <RHeader>Online R playground</RHeader>
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
              <p id="error">The Error:{error} </p>
            ) : (
              <div>
                <p id="output">
                  <div>
                    {loadingText.split(".").map((el, index) => {
                      if (index === 0) {
                        return (
                          <div>
                            <div className="loaderClass">
                              <img
                                style={{ height: "50px", width: "50px" }}
                                src={loader}
                                alt="Logo"
                              />
                            </div>

                            <b>{el}.</b>
                          </div>
                        );
                      }
                      return <div style={{ marginTop: "20px" }}>{el}</div>;
                    })}
                  </div>
                </p>
              </div>
            )}

            {topicIndex === 4 ? (
              <Canvas id="plot-canvas" width="1000px" height="1000px"></Canvas>
            ) : (
              ""
            )}
          </ResultSection>
        </RContainer>
      </Router>
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
