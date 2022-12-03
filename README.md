# Clicker program for detecting point scores
## Requirements
- [NodeJS](https://nodejs.org/en/download/)
- [Python](https://www.python.org/downloads/)
## Installation & usage
- Use npm install to install all needed packages
- Run the program with "node index"
Currently, the only supported site is "sports.williamhill.com" and the supported sport is tennis
When running the program, the program will prompt up a message saying
"Enter match ID and check top"
The first input should be a tennis match's ID from the URL and the second property is whether the program should scan for the top point or the bottom point
If you want to check for the top point, input "true", otherwise input "false"
The program will detect whether the point has changed and will emit a click event if it did in fact change. 
