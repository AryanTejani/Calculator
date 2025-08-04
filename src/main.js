import "./style.css"

// Calculator state
let expression = '0';
let result = '0';
let waitingForOperand = false;
let memory = 0;
let degreeMode = true;
let secondFunction = false;
let lastOperator = null;
let openParentheses = 0;

// Get display element
const displayElement = document.querySelector('.console');

// Update display to show expression
function updateDisplay() {
    displayElement.textContent = expression;
}

// Clear display
function clear() {
    expression = '0';
    result = '0';
    waitingForOperand = false;
    lastOperator = null;
    openParentheses = 0;
    updateDisplay();
}

// Handle number input
function inputNumber(num) {
    // This condition checks if we should start a brand new expression.
    // It's true if the display is "0" OR if a calculation was just completed (like after hitting "=").
    // We detect the "after equals" state because `waitingForOperand` is true, but the expression
    // does NOT end with an operator that would expect another number.
    if (expression === '0' || (waitingForOperand && !expression.match(/[\+\-\×\÷\(\^]$|mod$/))) {
        expression = num;
    } else {
        // In all other cases (like after '5+' or '√('), we append the number.
        expression += num;
    }

    // Any time a number is entered, we are now building an operand, so we reset the flag.
    waitingForOperand = false;
    updateDisplay();
}

// Handle decimal point
// Handle decimal point
function inputDecimal() {
    // Check if the current number segment already has a decimal.
    const parts = expression.split(/[\+\-\×\÷\(\)\^]|mod/);
    const currentNumber = parts[parts.length - 1];
    if (currentNumber.includes('.')) {
        return; // Do nothing if a decimal is already present.
    }

    // Use the same logic as inputNumber to decide whether to append or start a new number.
    if (waitingForOperand && !expression.match(/[\+\-\×\÷\(\^]$|mod$/)) {
        expression = '0.';
    } else if (expression.match(/[\+\-\×\÷\(\^]$|mod$/) || expression === '0') {
        expression += '0.';
    }
    else {
        expression += '.';
    }

    waitingForOperand = false;
    updateDisplay();
}
// Handle basic operators
function handleOperator(operator) {
    // If last character is an operator, replace it
    if (expression.match(/[\+\-\×\÷]$/)) {
        expression = expression.slice(0, -1) + operator;
    } else {
        expression += operator;
    }
    // This MUST be true. After an operator, you are waiting for the next operand.
    waitingForOperand = true;
    updateDisplay();
}

// Handle functions that wrap the current value
function wrapFunction(func, displayFunc) {
    // First, handle the special case where the expression is just '0'.
    if (expression === '0') {
        expression = displayFunc + '(';
    }
    // THEN, check if we need to imply multiplication (e.g., after a number like '5').
    else if (expression.match(/[\d\)]$/)) {
        expression += '×' + displayFunc + '(';
    }
    // For all other cases (like after an operator '+').
    else {
        expression += displayFunc + '(';
    }
    openParentheses++;
    waitingForOperand = false;
    updateDisplay();
}

// Handle power functions
function handlePower(type) {
    switch(type) {
        case 'square':
            expression += '²';
            break;
        case 'power':
            expression += '^';
            waitingForOperand = true;
            break;
        case 'power10':
            wrapFunction('power10', '10^');
            return;
    }
    updateDisplay();
}

// Handle scientific functions
function handleScientificFunction(func) {
    switch (func) {
        case 'sqrt':
            wrapFunction('sqrt', '√');
            break;
        case 'log':
            wrapFunction('log', 'log');
            break;
        case 'ln':
            wrapFunction('ln', 'ln');
            break;
        case 'exp':
            wrapFunction('exp', 'e^');
            break;
        case 'reciprocal':
            wrapFunction('reciprocal', '1/');
            break;
        case 'abs':
            wrapFunction('abs', '|', '|');
            break;
        case 'factorial':
            expression += '!';
            updateDisplay();
            break;
        case 'negate':
            if (expression === '0') {
                expression = '-';
            } else if (expression.startsWith('-')) {
                expression = expression.substring(1);
            } else {
                expression = '-' + expression;
            }
            updateDisplay();
            break;
        case 'floor':
            wrapFunction('floor', '⌊', '⌋');
            break;
        case 'ceil':
            wrapFunction('ceil', '⌈', '⌉');
            break;
        case 'rand':
            expression = 'rand()';
            updateDisplay();
            break;
    }
}

// Handle parentheses
function handleParenthesis(type) {
    if (type === '(') {
        if (expression === '0') {
            expression = '(';
        } else if (expression.match(/[\d\)]$/)) {
            expression += '×(';
        } else {
            expression += '(';
        }
        openParentheses++;
    } else if (type === ')' && openParentheses > 0) {
        expression += ')';
        openParentheses--;
    }
    updateDisplay();
}

// Handle equals - evaluate the expression
// Handle equals - evaluate the expression
// Handle equals - evaluate the expression
function handleEquals() {
    try {
        // Close any open parentheses automatically
        while (openParentheses > 0) {
            expression += ')';
            openParentheses--;
        }

        // --- Start of The Fix ---

        // Define safe functions that will be available to eval().
        // This is much safer than string replacement for handling DEG/RAD.
        const sin = (val) => degreeMode ? Math.sin(val * Math.PI / 180) : Math.sin(val);
        const cos = (val) => degreeMode ? Math.cos(val * Math.PI / 180) : Math.cos(val);
        const tan = (val) => degreeMode ? Math.tan(val * Math.PI / 180) : Math.tan(val);
        const asin = (val) => degreeMode ? Math.asin(val) * 180 / Math.PI : Math.asin(val);
        const acos = (val) => degreeMode ? Math.acos(val) * 180 / Math.PI : Math.acos(val);
        const atan = (val) => degreeMode ? Math.atan(val) * 180 / Math.PI : Math.atan(val);
        const log = (val) => Math.log10(val);
        const ln = (val) => Math.log(val);
        const sqrt = (val) => Math.sqrt(val);
        const factorial = (n) => {
            if (n < 0 || n % 1 !== 0) return NaN;
            if (n === 0 || n === 1) return 1;
            let result = 1;
            for (let i = 2; i <= n; i++) result *= i;
            return result;
        };

        // Convert the display string into a valid JavaScript expression.
        let evalExpression = expression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-') // Important: replaces visual minus with code minus
            .replace(/\^/g, '**')
            .replace(/²/g, '**2')
            .replace(/π/g, 'Math.PI')
            .replace(/e/g, 'Math.E')
            .replace(/mod/g, '%')
            // Now we replace the visual symbols with our safe function names
            .replace(/√/g, 'sqrt')
            .replace(/(\d+)!/g, 'factorial($1)')
            .replace(/rand\(\)/g, 'Math.random()')
            .replace(/\|([^|]+)\|/g, 'Math.abs($1)')
            .replace(/⌊([^⌋]+)⌋/g, 'Math.floor($1)')
            .replace(/⌈([^⌉]+)⌉/g, 'Math.ceil($1)');

        // --- End of The Fix ---

        // Evaluate the cleaned-up expression
        result = eval(evalExpression);

        // Handle cases like 1/0 that result in Infinity
        if (!Number.isFinite(result)) {
            throw new Error("Invalid calculation");
        }

        expression = String(result);
        waitingForOperand = true;
        updateDisplay();
    } catch (error) {
        expression = 'Error';
        updateDisplay();
        setTimeout(() => {
            clear();
        }, 1500);
    }
}
// Handle memory functions
function handleMemory(operation) {
    try {
        const currentValue = parseFloat(eval(expression.replace(/×/g, '*').replace(/÷/g, '/')));
        
        switch (operation) {
            case 'MC':
                memory = 0;
                break;
            case 'MR':
                expression = String(memory);
                waitingForOperand = true;
                updateDisplay();
                break;
            case 'M+':
                memory += currentValue;
                break;
            case 'M-':
                memory -= currentValue;
                break;
            case 'MS':
                memory = currentValue;
                break;
        }
    } catch (error) {
        // Invalid expression, ignore
    }
}

// Handle trigonometric functions
function handleTrig(func) {
    const displayFunc = secondFunction ? 'a' + func : func;
    wrapFunction(func, displayFunc);
}

// Handle modulo
function handleModulo() {
    expression += 'mod';
    waitingForOperand = true;
    updateDisplay();
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Number buttons
    const numberButtons = document.querySelectorAll('.seventh-row > .button:nth-child(2), .seventh-row > .button:nth-child(3), .seventh-row > .button:nth-child(4), .eightth-row > .button:nth-child(2), .eightth-row > .button:nth-child(3), .eightth-row > .button:nth-child(4), .nineth-row > .button:nth-child(2), .nineth-row > .button:nth-child(3), .nineth-row > .button:nth-child(4), .tenth-row > .button:nth-child(3)');
    const numbers = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0'];
    numberButtons.forEach((button, index) => {
        button.addEventListener('click', () => inputNumber(numbers[index]));
    });

    // Decimal point
    document.querySelector('.tenth-row > .button:nth-child(4)').addEventListener('click', inputDecimal);

    // Clear button
    document.querySelector('.fourth-row > .button:nth-child(4)').addEventListener('click', clear);

    // Basic operators
    document.querySelector('.seventh-row > .button:nth-child(5)').addEventListener('click', () => handleOperator('×'));
    document.querySelector('.eightth-row > .button:nth-child(5)').addEventListener('click', () => handleOperator('−'));
    document.querySelector('.nineth-row > .button:nth-child(5)').addEventListener('click', () => handleOperator('+'));
    document.querySelector('.sixth-row > .button:nth-child(5)').addEventListener('click', () => handleOperator('÷'));

    // Equals
    document.querySelector('.tenth-row > .button:nth-child(5)').addEventListener('click', handleEquals);

    // Scientific functions
    document.querySelector('.fifth-row > .button:nth-child(1)').addEventListener('click', () => handlePower('square'));
    document.querySelector('.fifth-row > .button:nth-child(2)').addEventListener('click', () => handleScientificFunction('reciprocal'));
    document.querySelector('.fifth-row > .button:nth-child(3)').addEventListener('click', () => handleScientificFunction('abs'));
    document.querySelector('.fifth-row > .button:nth-child(4)').addEventListener('click', () => handleScientificFunction('exp'));
    document.querySelector('.fifth-row > .button:nth-child(5)').addEventListener('click', () => handleModulo());
    
    document.querySelector('.sixth-row > .button:nth-child(1)').addEventListener('click', () => handleScientificFunction('sqrt'));
    document.querySelector('.sixth-row > .button:nth-child(2)').addEventListener('click', () => handleParenthesis('('));
    document.querySelector('.sixth-row > .button:nth-child(3)').addEventListener('click', () => handleParenthesis(')'));
    document.querySelector('.sixth-row > .button:nth-child(4)').addEventListener('click', () => handleScientificFunction('factorial'));
    
    document.querySelector('.seventh-row > .button:nth-child(1)').addEventListener('click', () => handlePower('power'));
    document.querySelector('.eightth-row > .button:nth-child(1)').addEventListener('click', () => handlePower('power10'));
    document.querySelector('.nineth-row > .button:nth-child(1)').addEventListener('click', () => handleScientificFunction('log'));
    document.querySelector('.tenth-row > .button:nth-child(1)').addEventListener('click', () => handleScientificFunction('ln'));
    document.querySelector('.tenth-row > .button:nth-child(2)').addEventListener('click', () => handleScientificFunction('negate'));

    // Memory buttons
    document.querySelector('.second-row > .button:nth-child(1)').addEventListener('click', () => handleMemory('MC'));
    document.querySelector('.second-row > .button:nth-child(2)').addEventListener('click', () => handleMemory('MR'));
    document.querySelector('.second-row > .button:nth-child(3)').addEventListener('click', () => handleMemory('M+'));
    document.querySelector('.second-row > .button:nth-child(4)').addEventListener('click', () => handleMemory('M-'));
    document.querySelector('.second-row > .button:nth-child(5)').addEventListener('click', () => handleMemory('MS'));

    // 2nd function toggle
    document.querySelector('.fourth-row > .button:nth-child(1)').addEventListener('click', () => {
        secondFunction = !secondFunction;
        const btn = document.querySelector('.fourth-row > .button:nth-child(1)');
        btn.style.backgroundColor = secondFunction ? '#3b82f6' : '';
        btn.style.color = secondFunction ? 'white' : 'black';
    });

    // DEG/RAD toggle
    document.querySelector('.first-row > .button:nth-child(1)').addEventListener('click', () => {
        degreeMode = !degreeMode;
        document.querySelector('.first-row > .button:nth-child(1)').textContent = degreeMode ? 'DEG' : 'RAD';
    });

    // Pi button
    document.querySelector('.fourth-row > .button:nth-child(2)').addEventListener('click', () => {
        if (expression === '0') {
            expression = 'π';
        } else if (expression.match(/[\d\)]$/)) {
            expression += '×π';
        } else {
            expression += 'π';
        }
        updateDisplay();
    });

    // Special functions from the dropdown grid
    const specialFunctions = document.querySelectorAll('.fourth-row .button');
    specialFunctions[0].addEventListener('click', () => handleScientificFunction('abs'));
    specialFunctions[1].addEventListener('click', () => handleScientificFunction('floor'));
    specialFunctions[2].addEventListener('click', () => handleScientificFunction('ceil'));
    specialFunctions[3].addEventListener('click', () => handleScientificFunction('rand'));

    // Trigonometry dropdown
    document.querySelector('.third-row > .button:nth-child(1)').addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Create dropdown for trig functions
        const trigFunctions = ['sin', 'cos', 'tan'];
        const dropdown = document.createElement('div');
        dropdown.className = 'absolute bg-white border border-gray-300 shadow-lg z-50';
        dropdown.style.top = '100%';
        dropdown.style.left = '0';
        
        trigFunctions.forEach(func => {
            const option = document.createElement('div');
            option.className = 'p-2 hover:bg-gray-200 cursor-pointer';
            option.textContent = secondFunction ? `a${func}` : func;
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                handleTrig(func);
                dropdown.remove();
            });
            dropdown.appendChild(option);
        });
        
        this.style.position = 'relative';
        this.appendChild(dropdown);
        
        // Remove dropdown when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function removeDropdown(e) {
                dropdown.remove();
                document.removeEventListener('click', removeDropdown);
            });
        }, 0);
    });

    // Initialize display
    updateDisplay();
});