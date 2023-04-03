import { fs } from "./fs";
import { stringToDataframe } from "./constant";

const isFSEntryDir = async (entry) => {
  const entryStat = await fs.stat(entry);
  return entryStat.type === "dir";
};

const createDirectory = async (path) => {
  try {
    await fs.mkdir(path);
  } catch (e) {
    if (!e.message.startsWith("EXIST")) throw e;
  }
};

const folderify = (paths) => {
  paths = paths.filter((path) => path.path !== "/" && path.path !== "");

  const files = paths.filter((path) => !path.isDir);
  const folders = paths.filter((path) => path.isDir);

  const currentDirDepth = folders.reduce((min, folder) => {
    const length = folder.path.split("/").length;
    return Math.min(length, min);
  }, Infinity);

  const foldersInCurrentDepth = folders.filter(
    (folder) => folder.path.split("/").length <= currentDirDepth
  );

  const filesInCurrentDepth = files.filter(
    (file) => file.path.split("/").length <= currentDirDepth
  );

  return [
    ...foldersInCurrentDepth.map((folder) => {
      return {
        ...folder,
        name: folder.path.split("/").slice(-1)[0],
        children: folderify(
          paths.filter(
            (path) =>
              path.path.startsWith(folder.path) && path.path !== folder.path
          )
        ),
      };
    }),

    ...filesInCurrentDepth.map((file) => {
      return {
        ...file,
        name: file.path.split("/").slice(-1)[0],
        children: null,
      };
    }),
  ];
};

const getEntriesFromFS = async (directory = "/", flatFS = []) => {
  if (directory === "/") {
    flatFS.push({ path: "/", isDir: true });
  }

  const childNodes = await fs.readdir(directory);

  for (let childNode of childNodes) {
    const absouleNodePath = (directory + "/" + childNode).replace("//", "/");
    const isNodeDirectory = await isFSEntryDir(absouleNodePath);

    if (!isNodeDirectory) {
      flatFS.push({ path: absouleNodePath, value: "" });
      continue;
    }

    flatFS.push({ path: absouleNodePath, isDir: true });
    await getEntriesFromFS(absouleNodePath, flatFS);
  }

  const sorted = flatFS.sort((a, b) => a.path.localeCompare(b.path));
  return sorted;
};

const createFS = async (entries) => {
  entries = entries.sort((a, b) => a.path - b.path);

  const folders = entries.filter((entry) => entry.isDir);
  const files = entries.filter((entry) => !entry.isDir);

  for (let folder of folders) {
    const { path } = folder;
    await createDirectory(path);
  }

  for (let file of files) {
    if (/\+([a-z]|[A-Z])+\+$/.test(file.path)) {
      continue;
    }
    const { value, path } = file;
    await fs.writeFile(path, value);
  }
};

const allFiles = (files) =>
  files.filter(
    (file) =>
      !file.isDir && (file.path.endsWith(".R") || file.path.endsWith(".csv"))
  );

const getValueOfGivenPath = (allFiles, path) => {
  const currentPathFile = allFiles.filter((file) => file.path === path);
  return currentPathFile[0].value;
};

const getUpdatedCode = (codeText, fileStructure) => {
  let sourceString;
  let readCsvString;
  // let rCode = codeText;
  let rCodeArray;
  const regexForSource = /source\(['"]([^'"]+)['"]\)/;

  const regexForReadCsvCode = /read.csv\(['"]([^'"]+)['"]\)/;

  rCodeArray = codeText.split("\n");

  const updatedCodeArr = [];

  const getMergedCode = (codeLine, fileFromAbsolutePath) => {
    const updatedCodeAfter = codeLine.replace(
      regexForSource,
      fileFromAbsolutePath[0].value
    );
    return updatedCodeAfter;
  };

  const getMergedCodeForCsv = (fileFromAbsolutePath, codeLine) => {
    const regexToFindReadCsvLine = /(\w+)\s*<-\s*read.csv\("[^"]*"\)/g;

    const matchForVar = regexToFindReadCsvLine.exec(codeLine);
    if (matchForVar) {
      const variableName = matchForVar[1];

      const updatedCodeAfter = codeLine.replace(
        regexToFindReadCsvLine,
        stringToDataframe(fileFromAbsolutePath[0].value, variableName)
      );
      return updatedCodeAfter;
    }
    return codeLine;
  };
  const getPathOfOpenedFile = fileStructure.filter((file) => file.opened)[0]
    .path;

  for (let i = 0; i < rCodeArray.length; i++) {
    let codeLine = rCodeArray[i];
    const matchedPathForCsv = codeLine.match(regexForReadCsvCode);
    if (matchedPathForCsv) {
      readCsvString = matchedPathForCsv[1].replace(/^\.\//, "");
    }

    const matchedPathForSource = codeLine.match(regexForSource);
    if (matchedPathForSource) {
      sourceString = matchedPathForSource[1].replace(/^\.\//, "");
    }

    const simpleImport = (locationString, csvImport = false) => {
      const currentActiveFolderPath = getPathOfOpenedFile
        .split("/")
        .slice(0, -1)
        .join("/");

      const absolutePathOfImportedFile = `${currentActiveFolderPath}/${locationString}`;
      let updatedMergedCode;
      const fileFromAbsolutePath = fileStructure.filter(
        (file) => file.path === absolutePathOfImportedFile
      );

      if (csvImport) {
        if (fileFromAbsolutePath.length) {
          return getMergedCodeForCsv(fileFromAbsolutePath, codeLine);
        }
        return codeLine;
      }

      if (fileFromAbsolutePath.length) {
        updatedMergedCode = getMergedCode(codeLine, fileFromAbsolutePath);

        return updatedMergedCode;
      }
      return codeLine;
    };

    const relativeImport = (locationString, csvImport = false) => {
      const numberOfFileReversal = locationString.split("../").length - 1;
      const fileToBeReached = locationString.split("../").pop();

      const currentActiveFolderPath = getPathOfOpenedFile
        .split("/")
        .slice(0, -`${numberOfFileReversal + 1}`)
        .join("/");

      const absolutePathOfImportedFile = `${currentActiveFolderPath}/${fileToBeReached}`;

      let updatedMergedCode;

      if (csvImport) {
        return getMergedCodeForCsv(absolutePathOfImportedFile, codeLine);
      }
      const fileFromAbsolutePath = fileStructure.filter(
        (file) => file.path === absolutePathOfImportedFile
      );

      if (fileFromAbsolutePath.length) {
        updatedMergedCode = getMergedCode(codeLine, fileFromAbsolutePath);

        return updatedMergedCode;
      }
      return codeLine;
    };

    const absoluteImport = (locationString, csvImport = false) => {
      const absolutePathOfImportedFile = `${locationString}`;

      let updatedMergedCode;

      if (csvImport) {
        return getMergedCodeForCsv(absolutePathOfImportedFile, codeLine);
      }
      const fileFromAbsolutePath = fileStructure.filter(
        (file) => file.path === absolutePathOfImportedFile
      );

      if (fileFromAbsolutePath.length) {
        updatedMergedCode = getMergedCode(codeLine, fileFromAbsolutePath);

        return updatedMergedCode;
      }
      return codeLine;
    };

    if (sourceString && /^[a-zA-Z]/.test(sourceString)) {
      codeLine = simpleImport(sourceString);
    }

    if (sourceString && sourceString.startsWith("/")) {
      codeLine = absoluteImport(sourceString);
    }

    if (sourceString && sourceString.startsWith("../")) {
      codeLine = relativeImport(sourceString);
    }

    //For csv import

    if (readCsvString && /^[a-zA-Z]/.test(readCsvString)) {
      codeLine = simpleImport(readCsvString, true);
    }

    if (readCsvString && readCsvString.startsWith("/")) {
      codeLine = absoluteImport(readCsvString, true);
    }

    if (readCsvString && readCsvString.startsWith("../")) {
      codeLine = relativeImport(readCsvString, true);
    }
    updatedCodeArr.push(codeLine);
  }
  console.log("The updated Code arr", updatedCodeArr);
  return updatedCodeArr.join("\n");
};

export {
  getEntriesFromFS,
  folderify,
  fs,
  createFS,
  allFiles,
  getValueOfGivenPath,
  getUpdatedCode,
};
