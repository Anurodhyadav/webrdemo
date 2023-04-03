export const stringToDataframe = (csvInString, variableName) => {

return `
my_string <- ${csvInString}


my_lines <- strsplit(my_string, "\n")[[1]]


col_names <- strsplit(my_lines[1], ",")[[1]]


my_matrix <- matrix(unlist(strsplit(my_lines[-1], ",")), ncol = length(col_names), byrow = TRUE)


${variableName} <- data.frame(my_matrix, stringsAsFactors = FALSE)

names(${variableName}) <- col_names
print(${variableName})`
}