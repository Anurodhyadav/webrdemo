import React, { useContext } from "react";
import { folderify, fs, allFiles, getValueOfGivenPath } from "./utils";
import styled from "styled-components";

import { RContext } from "./context";

export const NodeStructure = ({ activeFile, setActiveFile, setCode }) => {
  const { setFileStructure, fileStructure } = useContext(RContext);
  const allFilesInfo = allFiles(fileStructure);
  const handleFileChange = (e, path) => {
    let i;
    const codeFile = getValueOfGivenPath(allFilesInfo, path);

    const updatedFileStructure = fileStructure.map((file) => {
      if (file.path === path) {
        file.opened = true;
      } else {
        file.opened = false;
      }
      return file;
    });

    setFileStructure(updatedFileStructure);

    setCode(codeFile);
    const tablinks = document.getElementsByClassName("tablink");

    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace("highlight", "");
    }
    if (e) {
      e.currentTarget.className += "highlight";
    }
  };

  const openFile = (path) => {
    const file = fileStructure.find((file) => file.path === path);

    handleFileChange(null, path);

    if (!file) return;

    setActiveFile(file);
  };

  const handleNameChange = (e) => {
    console.log("The e", e);
  };
  const addFolder = (e, folderPath) => {
    e.stopPropagation();
    const folderName = "RAM";
    const folderState = { isDir: true, path: `${folderPath}/${folderName}` };
    const fileStructureClone = [...fileStructure];
    fileStructureClone.push(folderState);
    setFileStructure(fileStructureClone);
  };

  const addFile = (e, filePath) => {
    e.stopPropagation();
    const fileName = "newFile.R";
    const fileState = {
      value: ``,
      opened: false,
      path: `${filePath}/${fileName}`,
    };

    const fileStructureClone = [...fileStructure];
    fileStructureClone.push(fileState);
    setFileStructure(fileStructureClone);
  };

  const toggleExpansion = (path) => {
    const newState = [...fileStructure];

    const folder = newState.find((file) => file.path === path);
    if (!folder) return;

    folder.expanded = !folder.expanded;
    setFileStructure(newState);
  };
  function handleCsvFileUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const fileName = file.name;
      const fileState = {
        value:  `"${reader.result}"`,
        opened: false,
        path: `/RCode/src/${fileName}`,
      };

      const fileStructureClone = [...fileStructure];
      fileStructureClone.push(fileState);
      setFileStructure(fileStructureClone);
    };
    reader.readAsText(file);
  }

  const fileTree = folderify(fileStructure);

  const NodeRecursion = ({ node }) => {
    return (
      <div>
        {node.map((nodeProps, idx) => {
          const {
            expanded,
            name,
            isDir,
            children,
            path,
            opened,
            status = "",
          } = nodeProps;
          if (isDir) {
            return (
              <FolderandOptions>
                <Folder
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpansion(path);
                  }}
                >
                  {name}
                  {expanded ? (
                    <div style={{ marginLeft: "20px" }}>
                      {children && <NodeRecursion node={children} />}
                    </div>
                  ) : (
                    ""
                  )}
                </Folder>
                <div
                  onClick={(e) => addFolder(e, path)}
                  style={{ color: "blue", cursor: "pointer" }}
                >
                  Fo
                </div>
                <div
                  onClick={(e) => addFile(e, path)}
                  style={{ color: "red", cursor: "pointer" }}
                >
                  Fi
                </div>
              </FolderandOptions>
            );
          }

          if (/\+([a-z]|[A-Z])+\+$/.test(path)) {
            return (
              <File>
                <input
                  type="text"
                  name="message"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    handleNameChange(e);
                  }}
                />
              </File>
            );
          }

          return (
            <FileandOptions>
              <File
                key={idx}
                style={{
                  ...(activeFile && activeFile.path === path
                    ? { backgroundColor: "#ADD8E6" }
                    : { backgroundColor: "transparent" }),
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  openFile(path);
                }}
              >
                {name} {status}
              </File>
            </FileandOptions>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <div>
        <h2>Upload a CSV file</h2>
        <input type="file" accept=".csv" onChange={handleCsvFileUpload} />
      </div>
      <NodeRecursion node={fileTree} />
    </div>
  );
};

const Folder = styled.div`
  cursor: pointer;
`;

const FolderandOptions = styled.div`
  display: flex;
  gap: 5px;
`;

const File = styled.div`
  cursor: pointer;
`;

const FileandOptions = styled.div`
  display: flex;
  gap: 5px;
`;
