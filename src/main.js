import "./style.css";

// Calculator state
let expression = "0";
let result = "0";
let waitingForOperand = false;
let memory = 0;
let degreeMode = true;
let secondFunction = false;
let lastOperator = null;
let openParentheses = 0;
let scientificNotation = false;
let calculationDone = false; 
// Get display element
const displayElement = document.querySelector(".console");

// Update display to show expression
function updateDisplay() {
  const mainDisplay = document.querySelector("#main-display");
  const secondaryDisplay = document.querySelector("#secondary-display");

  if (calculationDone) {
    // After '=', show the full expression on top
    secondaryDisplay.textContent = expression + "=";
    // And show the formatted result on the bottom
    if (scientificNotation) {
      mainDisplay.textContent = Number(result).toExponential(9);
    } else {
      mainDisplay.textContent = String(result);
    }
  } else {
    // During input, show the full expression on top
    secondaryDisplay.textContent = expression;
    // And show the current number being typed on the bottom
    const parts = expression.split(/[\+\−\×\÷\(\^]|%/);
    const currentOperand = parts[parts.length - 1];
    // Show 0 if the operand is empty (e.g., right after an operator)
    mainDisplay.textContent = currentOperand || "0";
  }
}
// Clear display
function clear() {
  expression = "0";
  result = "0";
  waitingForOperand = false;
  lastOperator = null;
  openParentheses = 0;
  calculationDone = false; // Reset the new flag
  updateDisplay();
}
// Handle number input
function inputNumber(num) {
  // Add auto-multiplication after constants like π or e

  if (calculationDone) {
    expression = "0";
    calculationDone = false;
  }

  if (expression.endsWith("π") || expression.endsWith("e")) {
    expression += "×" + num;
    waitingForOperand = false;
    updateDisplay();
    return;
  }

  if (
    expression === "0" ||
    (waitingForOperand && !expression.match(/[\+\−\×\÷\(\^]$|%$/))
  ) {
    expression = num;
  } else {
    expression += num;
  }
  waitingForOperand = false;
  updateDisplay();
}

// Handle decimal point
// Handle decimal point
function inputDecimal() {
  if (calculationDone) {
    expression = "0";
    calculationDone = false;
  }
  // Check if the current number segment already has a decimal.
  const parts = expression.split(/[\+\−\×\÷\(\)\^]|%/);
  const currentNumber = parts[parts.length - 1];
  if (currentNumber.includes(".")) {
    return; // Do nothing if a decimal is already present.
  }

  // Use the same logic as inputNumber to decide whether to append or start a new number.
  if (waitingForOperand && !expression.match(/[\+\−\×\÷\(\^]$|%$/)) {
    expression = "0.";
  } else if (expression.match(/[\+\−\×\÷\(\^]$|%$/) || expression === "0") {
    expression += "0.";
  } else {
    expression += ".";
  }

  waitingForOperand = false;
  updateDisplay();
}
// Handle basic operators
function handleOperator(operator) {
  if (calculationDone) {
    // Start new calculation with the previous result, correctly formatted
     if (scientificNotation) {
        expression = Number(result).toExponential(9);
    } else {
        expression = String(result);
    }
    calculationDone = false;
  }
  // If last character is an operator, replace it
  if (expression.match(/[\+\−\×\÷]$/)) {
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
  if (calculationDone) {
    expression = "0";
    calculationDone = false;
  }
  // First, handle the special case where the expression is just '0'.
  if (expression === "0") {
    expression = displayFunc + "(";
  }
  // THEN, check if we need to imply multiplication (e.g., after a number like '5').
  else if (expression.match(/[\d\)]$/)) {
    expression += "×" + displayFunc + "(";
  }
  // For all other cases (like after an operator '+').
  else {
    expression += displayFunc + "(";
  }
  openParentheses++;
  waitingForOperand = false;
  updateDisplay();
}

// Handle power functions
function handlePower(type) {
  switch (type) {
    case "square":
      expression += "²";
      break;
    case "power":
      expression += "^";
      waitingForOperand = true;
      break;
    case "power10":
      wrapFunction("power10", "10^");
      return;
  }
  updateDisplay();
}

// Handle scientific functions
function handleScientificFunction(func) {
  switch (func) {
    case "sqrt":
      wrapFunction("sqrt", "√");
      break;
    case "log":
      wrapFunction("log", "log");
      break;
    case "ln":
      wrapFunction("ln", "ln");
      break;
    case "exp":
      wrapFunction("exp", "e^");
      break;
    case "reciprocal":
      wrapFunction("reciprocal", "1/");
      break;
    case "abs":
      // Handle these special cases directly for clarity.
      expression = "|" + expression + "|";
      updateDisplay();
      break;
    case "floor":
      expression = "⌊" + expression + "⌋";
      updateDisplay();
      break;
    case "ceil":
      expression = "⌈" + expression + "⌉";
      updateDisplay();
      break;
    case "factorial":
      expression += "!";
      updateDisplay();
      break;
    case "negate":
      if (expression === "0") {
        expression = "-";
      } else if (expression.startsWith("-")) {
        expression = expression.substring(1);
      } else {
        expression = "-" + expression;
      }
      updateDisplay();
      break;
    case "rand":
      if (expression === "0" || waitingForOperand) {
        expression = "rand()";
      } else {
        expression += "×rand()";
      }
      updateDisplay();
      break;
  }
}

// Handle parentheses
function handleParenthesis(type) {
  if (type === "(") {
    if (expression === "0") {
      expression = "(";
    } else if (expression.match(/[\d\)]$/)) {
      expression += "×(";
    } else {
      expression += "(";
    }
    openParentheses++;
  } else if (type === ")" && openParentheses > 0) {
    expression += ")";
    openParentheses--;
  }
  updateDisplay();
}

const feButton = document.querySelector(".first-row > .button:nth-child(2)");
feButton.addEventListener("click", () => {
  scientificNotation = !scientificNotation;
  // Add a visual indicator to the button
  feButton.style.backgroundColor = scientificNotation ? "#a0aec0" : ""; // A gray color when active
  feButton.style.color = scientificNotation ? "white" : "black";
});

function handleEquals() {
  try {
    // This part closes any open parentheses automatically.
    while (openParentheses > 0) {
      expression += ")";
      openParentheses--;
    }

    // (The safe functions like sin, cos, etc. remain the same)
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


    // Translates the display string into a JavaScript formula.
    let evalExpression = expression
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-")
      .replace(/\^/g, "**")
      .replace(/²/g, "**2")
      .replace(/π/g, "Math.PI")
      .replace(/e/g, "Math.E")
      .replace(/%/g, "%")
      .replace(/√/g, "sqrt")
      .replace(/(\d+)!/g, "factorial($1)")
      .replace(/rand\(\)/g, "Math.random()")
      .replace(/\|([^|]+)\|/g, "Math.abs($1)")
      .replace(/⌊([^⌋]+)⌋/g, "Math.floor($1)")
      .replace(/⌈([^⌉]+)⌉/g, "Math.ceil($1)");

    // Calculates the result.
    result = eval(evalExpression);

    // Saves the calculation to history.
    const calculationRecord = {
      expression: expression,
      result: result,
    };
    calculationHistory.push(calculationRecord);
    if (calculationHistory.length > 20) {
      calculationHistory.shift();
    }

    // Handles errors like division by zero.
    if (!Number.isFinite(result)) {
      throw new Error("Invalid calculation");
    }

    // Set the flag and let updateDisplay do the work
    calculationDone = true;
    waitingForOperand = true;
    updateDisplay();

  } catch (error) {
    // If anything goes wrong, displays "Error".
    expression = "Error";
    calculationDone = false; // Reset flag on error
    updateDisplay();
    setTimeout(() => {
      clear();
    }, 1500);
  }
}
// Handle memory functions
function handleMemory(operation) {
  try {
    const currentValue = parseFloat(
      eval(expression.replace(/×/g, "*").replace(/÷/g, "/"))
    );

    switch (operation) {
      case "MC":
        memory = 0;
        break;
      case "MR":
        expression = String(memory);
        waitingForOperand = true;
        updateDisplay();
        break;
      case "M+":
        memory += currentValue;
        break;
      case "M-":
        memory -= currentValue;
        break;
      case "MS":
        memory = currentValue;
        break;
    }
  } catch (error) {
    // Invalid expression, ignore
  }
}

// Handle trigonometric functions
function handleTrig(func) {
  const displayFunc = secondFunction ? "a" + func : func;
  wrapFunction(func, displayFunc);
}

// Handle modulo
function handleModulo() {
  expression += "%";
  waitingForOperand = true;
  updateDisplay();
}

// Event listeners
document.addEventListener("DOMContentLoaded", function () {
  // Number buttons
  const numberButtons = document.querySelectorAll(
    ".seventh-row > .button:nth-child(2), .seventh-row > .button:nth-child(3), .seventh-row > .button:nth-child(4), .eightth-row > .button:nth-child(2), .eightth-row > .button:nth-child(3), .eightth-row > .button:nth-child(4), .nineth-row > .button:nth-child(2), .nineth-row > .button:nth-child(3), .nineth-row > .button:nth-child(4), .tenth-row > .button:nth-child(3)"
  );
  const numbers = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0"];
  numberButtons.forEach((button, index) => {
    button.addEventListener("click", () => inputNumber(numbers[index]));
  });

  // Decimal point
  document
    .querySelector(".tenth-row > .button:nth-child(4)")
    .addEventListener("click", inputDecimal);

  // Clear button
  document
    .querySelector(".fourth-row > .button:nth-child(4)")
    .addEventListener("click", clear);

  // Basic operators
  document
    .querySelector(".seventh-row > .button:nth-child(5)")
    .addEventListener("click", () => handleOperator("×"));
  document
    .querySelector(".eightth-row > .button:nth-child(5)")
    .addEventListener("click", () => handleOperator("−"));
  document
    .querySelector(".nineth-row > .button:nth-child(5)")
    .addEventListener("click", () => handleOperator("+"));
  document
    .querySelector(".sixth-row > .button:nth-child(5)")
    .addEventListener("click", () => handleOperator("÷"));

  // Equals
  document
    .querySelector(".tenth-row > .button:nth-child(5)")
    .addEventListener("click", handleEquals);

  // Scientific functions
  document
    .querySelector(".fifth-row > .button:nth-child(1)")
    .addEventListener("click", () => handlePower("square"));
  document
    .querySelector(".fifth-row > .button:nth-child(2)")
    .addEventListener("click", () => handleScientificFunction("reciprocal"));
  document
    .querySelector(".fifth-row > .button:nth-child(3)")
    .addEventListener("click", () => handleScientificFunction("abs"));
  document
    .querySelector(".fifth-row > .button:nth-child(4)")
    .addEventListener("click", () => handleScientificFunction("exp"));
  document
    .querySelector(".fifth-row > .button:nth-child(5)")
    .addEventListener("click", () => handleModulo());

  document
    .querySelector(".sixth-row > .button:nth-child(1)")
    .addEventListener("click", () => handleScientificFunction("sqrt"));
  document
    .querySelector(".sixth-row > .button:nth-child(2)")
    .addEventListener("click", () => handleParenthesis("("));
  document
    .querySelector(".sixth-row > .button:nth-child(3)")
    .addEventListener("click", () => handleParenthesis(")"));
  document
    .querySelector(".sixth-row > .button:nth-child(4)")
    .addEventListener("click", () => handleScientificFunction("factorial"));

  document
    .querySelector(".seventh-row > .button:nth-child(1)")
    .addEventListener("click", () => handlePower("power"));
  document
    .querySelector(".eightth-row > .button:nth-child(1)")
    .addEventListener("click", () => handlePower("power10"));
  document
    .querySelector(".nineth-row > .button:nth-child(1)")
    .addEventListener("click", () => handleScientificFunction("log"));
  document
    .querySelector(".tenth-row > .button:nth-child(1)")
    .addEventListener("click", () => handleScientificFunction("ln"));
  document
    .querySelector(".tenth-row > .button:nth-child(2)")
    .addEventListener("click", () => handleScientificFunction("negate"));

  // Memory buttons
  document
    .querySelector(".second-row > .button:nth-child(1)")
    .addEventListener("click", () => handleMemory("MC"));
  document
    .querySelector(".second-row > .button:nth-child(2)")
    .addEventListener("click", () => handleMemory("MR"));
  document
    .querySelector(".second-row > .button:nth-child(3)")
    .addEventListener("click", () => handleMemory("M+"));
  document
    .querySelector(".second-row > .button:nth-child(4)")
    .addEventListener("click", () => handleMemory("M-"));
  document
    .querySelector(".second-row > .button:nth-child(5)")
    .addEventListener("click", () => handleMemory("MS"));

  // 2nd function toggle
  document
    .querySelector(".fourth-row > .button:nth-child(1)")
    .addEventListener("click", () => {
      secondFunction = !secondFunction;
      const btn = document.querySelector(".fourth-row > .button:nth-child(1)");
      btn.style.backgroundColor = secondFunction ? "#3b82f6" : "";
      btn.style.color = secondFunction ? "white" : "black";
    });

  // DEG/RAD toggle
  document
    .querySelector(".first-row > .button:nth-child(1)")
    .addEventListener("click", () => {
      degreeMode = !degreeMode;
      document.querySelector(".first-row > .button:nth-child(1)").textContent =
        degreeMode ? "DEG" : "RAD";
    });

  // Pi button
  document
    .querySelector(".fourth-row > .button:nth-child(2)")
    .addEventListener("click", () => {
      if (expression === "0") {
        expression = "π";
      } else if (expression.match(/[\d\)]$/)) {
        expression += "×π";
      } else {
        expression += "π";
      }
      updateDisplay();
    });

  // Special functions from the dropdown grid
  const specialFunctions = document.querySelectorAll(
    ".fourth-row .bg-sky-500 .button"
  );
  specialFunctions[0].addEventListener("click", () =>
    handleScientificFunction("abs")
  );
  specialFunctions[1].addEventListener("click", () =>
    handleScientificFunction("floor")
  );
  specialFunctions[2].addEventListener("click", () =>
    handleScientificFunction("ceil")
  );
  specialFunctions[3].addEventListener("click", () =>
    handleScientificFunction("rand")
  );
  // The dms and deg buttons are not assigned functionality yet.

  // Trigonometry dropdown
  document
    .querySelector(".third-row > .button:nth-child(1)")
    .addEventListener("click", function (e) {
      e.stopPropagation();

      // Create dropdown for trig functions
      const trigFunctions = ["sin", "cos", "tan"];
      const dropdown = document.createElement("div");
      dropdown.className =
        "absolute bg-white border border-gray-300 shadow-lg z-50";
      dropdown.style.top = "100%";
      dropdown.style.left = "0";

      trigFunctions.forEach((func) => {
        const option = document.createElement("div");
        option.className = "p-2 hover:bg-gray-200 cursor-pointer";
        option.textContent = secondFunction ? `a${func}` : func;
        option.addEventListener("click", (e) => {
          e.stopPropagation();
          handleTrig(func);
          dropdown.remove();
        });
        dropdown.appendChild(option);
      });

      this.style.position = "relative";
      this.appendChild(dropdown);

      // Remove dropdown when clicking outside
      setTimeout(() => {
        document.addEventListener("click", function removeDropdown(e) {
          dropdown.remove();
          document.removeEventListener("click", removeDropdown);
        });
      }, 0);
    });

  // Initialize display
  updateDisplay();
});

// --- START: HISTORY FEATURE CODE ---

// You only need one variable for history
let calculationHistory = [];

const historyBtn = document.querySelector("#history-btn");
const historyPanel = document.querySelector("#history-panel");
const historyList = document.querySelector("#history-list");
const clearHistoryBtn = document.querySelector("#clear-history-btn");

// Function to render the history items onto the panel
function renderHistory() {
  historyList.innerHTML = ""; // Clear the current list

  // Use the new, safe variable name here
  if (calculationHistory.length === 0) {
    historyList.innerHTML =
      '<p class="text-gray-500 text-sm">No history yet.</p>';
    return;
  }
  // And here
  calculationHistory.forEach((item) => {
    const historyItem = document.createElement("div");
    historyItem.className = "bg-gray-100 p-2 rounded";
    historyItem.innerHTML = `
                <div class="text-xs text-gray-600">${item.expression}</div>
                <div class="font-bold text-right">${item.result}</div>
            `;
    historyList.appendChild(historyItem);
  });
}

// Listener to show/hide the history panel
historyBtn.addEventListener("click", () => {
  renderHistory(); // This function now correctly uses calculationHistory
  historyPanel.classList.toggle("hidden");
});

// Listener to clear the history
clearHistoryBtn.addEventListener("click", () => {
  // And finally, use the new variable name here
  calculationHistory = [];
  renderHistory();
});

// --- END: HISTORY FEATURE CODE ---
