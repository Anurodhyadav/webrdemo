import "./App.css";
import React, { useEffect, useState, useRef } from "react";
import { Console } from "@r-wasm/webr";
import styled from "styled-components";
import { FilesAndCodes } from "./constant";
import { BrowserRouter as Router } from "react-router-dom";

import newLogo from "./newLogo.svg";

const loadingText = `Datamentor is loading resources for a seamless coding
experience. You can start typing your code on the left and
unleash your coding superpowers 💪`;

const innitialTextAfterLoading = `R version 4.1.3 (2022-03-10)`;

const webRConsole = new Console({
  canvasExec: (line) => {
    const canvasElem = document.getElementById("plot-canvas");
    canvasElem.style.display = "block";

    return Function(`
  document.getElementById('plot-canvas').getContext('2d').${line};
`)();
  },
  stdout: (line) => {
    const resultContainer = document.getElementById("output-section");
    const runBtn = document.getElementById("run-btn");

    if (!resultContainer) return;

    const output = line;

    const lineEle = document.createElement("div");
    lineEle.style.color = "black";
    lineEle.innerText = output;

    if (output.startsWith("[1]")) {
      resultContainer.appendChild(lineEle);
    } else {
      const currentInnerText = resultContainer?.textContent;
      if (currentInnerText !== innitialTextAfterLoading) {
        lineEle.innerText = innitialTextAfterLoading;
        resultContainer.appendChild(lineEle);
        runBtn.disabled = false;
        runBtn.classList.remove("not-allowed");

        document.getElementById("tooltipId").remove("tooltip");
        runBtn.style.backgroundColor = "#2455EA";
      }
    }
    const firstChildTextContent = resultContainer.firstChild.textContent;
    if (
      firstChildTextContent.replace(/\s/g, "") ===
      loadingText.replace(/\s/g, "")
    ) {
      resultContainer.removeChild(resultContainer.firstChild);
    }
  },
  stderr: (line) => {
    const resultContainer = document.getElementById("output-section");
    const errorEle = document.createElement("div");
    errorEle.style.color = "#E34C4C";
    errorEle.innerHTML = line;

    resultContainer.appendChild(errorEle);
  },

  prompt: (p) => document.getElementById("output-section").append(p),
});
webRConsole.run();

function App() {
  const [code, setCode] = useState(FilesAndCodes[0].initialCode);
  const codeEditorWrapperRef = useRef(null);
  const codeMirrorRef = useRef(null);
  let resizer;

  const loadCodeMirror = () => {
    codeMirrorRef.current = window.CodeMirror(codeEditorWrapperRef.current, {
      lineNumbers: true,
      lineWrapping: true,

      value: code,
    });
  };

  useEffect(() => {
    resizer = document.getElementById("codeandFile");
    const runBtnElem = document.getElementById("run-btn");
    runBtnElem.disabled = true;
    runBtnElem.classList.add("not-allowed");
    runBtnElem.style.backgroundColor = "#54575B";
    document.getElementById("plot-canvas").style.display = "none";
    loadCodeMirror();
    return () => {
      codeEditorWrapperRef.current.innerText = "";
    };
  }, []);

  const ResizeElement = () => {
    document.addEventListener("mousemove", resize, false);
    document.addEventListener(
      "mouseup",
      () => {
        document.removeEventListener("mousemove", resize, false);
      },
      false
    );

    function resize(e) {
      const size = `${e.x}px`;
      resizer.style.width = size;
    }
  };

  const runRCode = async () => {
    const codeToRun = codeMirrorRef.current.getValue();
    const resultContainer = document.getElementById("output-section");
    resultContainer.innerText = "";
    webRConsole.stdin(codeToRun);
  };

  const handleFileChange = (e, index) => {
    let i;

    const codeFile = FilesAndCodes[index].initialCode;

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
        <LogoAndHeader>
          <img style={{ height: "32px", width: "32px" }} src={newLogo} />
          <RHeader>R Code Playground </RHeader>
        </LogoAndHeader>

        <RContainer>
          <CodeandFile id="codeandFile">
            <FileandRun className="fileAndRun">
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

              <RunButton
                id="run-btn"
                className="toolTip-wrapper"
                onClick={runRCode}
              >
                Run
                <div id="tooltipId" class="tooltip">
                  Files loading, please wait.
                </div>
              </RunButton>
            </FileandRun>
            <div ref={codeEditorWrapperRef}></div>
          </CodeandFile>
          <ResizeBar
            onMouseDown={ResizeElement}
            className="resize-bar"
          ></ResizeBar>
          <ResultSection id="result-container">
            <OutputHeader>Output</OutputHeader>
            <div id="output-section">
              <div className="loading-text">
                {loadingText.split(".").map((el, index) => {
                  if (index === 0) {
                    return (
                      <div className="mainLoadingText">
                        <div>
                          <p className="text-main">{el}.</p>
                        </div>
                      </div>
                    );
                  }
                  return <div className="secondaryLoadingText">{el}</div>;
                })}
              </div>
            </div>

            <Canvas id="plot-canvas" width={"1008"} height={"1008"}></Canvas>
          </ResultSection>
        </RContainer>
      </Router>
    </div>
  );
}

const RContainer = styled.div`
  display: flex;
  width: 100%;
  height: calc(100vh - 105px);
  overflow: scroll;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const RHeader = styled.div`
  font-family: lightFont;
  text-align: left;
  width: 100%;
`;

const ResizeBar = styled.div`
  display: inline;
  width: 5px;
  height: 100vh;
  background-color: #d5dce5;
  cursor: ew-resize;
  @media (max-width: 768px) {
    display: none;
  }
`;

const RunButton = styled.button`
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 2px;
  padding: 8px 24px;
  width: 78px;
  height: 34px;
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
  color: white;
  cursor: pointer;
  &:hover {
    background-color: #1b46c9;
  }
`;

const LogoAndHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 24px;
`;

const FileNames = styled.div`
  display: flex;
  cursor: pointer;
`;

const CodeandFile = styled.div`
  width: 50%;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 100%;
    height: 40vh;
  }
`;
const FileandRun = styled.div`
  display: flex;
  position: relative;
  align-items: center;
  background-color: #eff2f6;
  justify-content: space-between;
  padding: 0px 29px;
  padding-right: 12px;
  border: 1px solid #d5dce5;
  border-width: 1px 1px 0px 0px;
`;
const OutputHeader = styled.div`
  font-family: lightFont;
  background-color: #eff2f6;
  padding: 11px 24px;
  border: 1px solid #d5dce5;
  border-left: 0px;
`;

const ResultSection = styled.div`
  z-index: 100;
  flex: 1;
  text-align: left;
  justify-content: flex-start;
  min-width: 300px;
`;

const Canvas = styled.canvas`
  object-fit: contain;
  transform: scale(0.5);
  transform-origin: left top;
  @media (max-width: 768px) {
    transform: scale(0.3);
  }
`;

export default App;
