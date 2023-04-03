import React, { useState } from "react";

export const RContext = React.createContext();
const fileStructureInfo = [
  { isDir: true, path: "/RCode" },
  { isDir: true, path: "/RCode/src" },
  { path: "/RCode/src/+file+" },
  {
    value: `## Online R compiler to run R program online
    source("second.R")
    Num <-2
    result <- divide_by_two(Num)
    print(result)
  `,
    opened: true,
    path: "/RCode/src/main.R",
  },
  {
    value: `## The code for second.r
    divide_by_two <- function(x) {
      return(x/2)
    }
    `,
    opened: false,
    path: "/RCode/src/second.R",
  },
  { isDir: true, path: "/RCode/src/plot" },
  {
    value: `## The code for plot
  x=seq(-pi,pi,0.1)
  y=sin(x)
  plot(x,y)
      `,
    opened: false,
    path: "/RCode/src/plot/graph.R",
  },
  {
    value: `## The code for second.r
    divide_by_three <- function(x) {
      return(x/3)
    }
    `,
    opened: false,
    path: "/RCode/src/plot/third.R",
  },
  { isDir: true, path: "/RCode/src/file" },
  {
    value: `## The code for second.r
    divide_by_me <- function(x) {
      return(x/2)
    }
    `,

    opened: false,
    path: "/RCode/src/file/hello.R",
  },
  { isDir: true, path: "/RCode/src/file/file2" },
  {
    value: `## Online R compiler to run R program online
    source("../hello.R")
    Num <-2
    result <- divide_by_two(Num)
    print(result)
  `,
    opened: false,
    path: "/RCode/src/file/file2/sello.R",
  },
];

export const WebRContext = ({ children }) => {
  const [fileStructure, setFileStructure] = useState(fileStructureInfo);

  return (
    <RContext.Provider value={{ fileStructure, setFileStructure }}>
      {children}
    </RContext.Provider>
  );
};
