function main() {
    ask("What's 5 x 5?",5*5);
}

function ask(question, correct) {
    let answer=prompt(question);
    if (answer==correct) alert("Correct!");
    else alert("Wrong!");
}

main();
