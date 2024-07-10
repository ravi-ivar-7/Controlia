console.log(`Number of arguments: ${process.argv.length - 2}`);
process.argv.slice(2).forEach((arg, index) => {
    console.log(`Argument ${index + 1}: ${arg}`);
});
