export const FilesAndCodes = [
  {
    fileName: "hello.r",
    initialCode: `
        ## Online R compiler to run R program online
        ## Print "Hello World!" message
        message <-"Hello R!"
        print(message)`,
  },
  {
    fileName: "if-else.r",
    initialCode: `
      age <- 15

      # check if age is greater than 18
      if (age > 18) {
        print("You are eligible to vote.")
      } else {
        print("You cannot vote.")
      }
           `,
  },

  {
    fileName: "while-loop.r",
    initialCode: `

    # variable to store current number
    number = 1

    # variable to store current sum
    sum = 0

    # while loop to calculate sum
    while(number <= 10) {

    # calculate sum
    sum = sum + number
    
    # increment number by 1
    number = number + 1
}

print(sum)
        `,
  },
  {
    fileName: "for-loop.r",
    initialCode: `
    # vector of numbers
    num = c(2, 3, 12, 14, 5, 19, 23, 64)

    # variable to store the count of even numbers
    count = 0

    # for loop to count even numbers
    for (i in num) {

    # check if i is even
    if (i %% 2 == 0) {
        count = count + 1
    }
}

print(count)

        `,
  },

  {
    fileName: "plot.r",
    initialCode: `
    temperatures <- c(22, 27, 26, 24, 23, 26, 28)

    result <- barplot(temperatures, 
    main = "Maximum Temperatures in a Week")

    print(result)
    
    `,
  },
];
