import "./App.css";
import React, { useState } from "react";
import { WebR } from "@r-wasm/webr";
import styled from "styled-components";
import Editor from "@monaco-editor/react";

const webR = new WebR();

function App() {
  const [result, updateResult] = useState(["Loading webR..."]);
  const [code, setCode] = useState(`
  ## Online R compiler to run R program online
  ## Print "Hello World!" message
  message <-"Hello R!"
  print(message)`);
  const [error, setError] = useState("");
  let rnorm;

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
    rnorm = await evaluateCode(code);

    if (rnorm) {
      try {
        const result = await rnorm.toArray();
        updateResult(result);
      } catch (e) {
        console.log("The error", e);
        setError(e.message);
      }
    }
  };

  return (
    <div className="App">
      <RContainer>
        <CodeandFile>
          <RHeader>R online Compiler</RHeader>
          <FileandRun>
            <div>main.r</div>
            <button onClick={runRCode}>Run</button>
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

        <ResultSection>
          {error ? (
            <p>The Error:{error} </p>
          ) : (
            <p>Result : {result.join(",")}</p>
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
`;

const CodeandFile = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;
const FileandRun = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ResultSection = styled.div`
  flex: 1;
`;

export default App;
