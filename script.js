let currentInput = '';
        let result = '0';
        let shouldResetInput = false;
        let angleMode = 'DEG'; // DEG or RAD
        let memory = 0;

        const inputDisplay = document.getElementById('input');
        const resultDisplay = document.getElementById('result');
        const modeDisplay = document.getElementById('mode');

        function updateDisplay() {
            inputDisplay.textContent = currentInput;
            resultDisplay.textContent = result;
            modeDisplay.textContent = `${angleMode} | M: ${memory.toFixed(2)}`;
        }

        function appendNumber(number) {
            if (shouldResetInput) {
                currentInput = '';
                shouldResetInput = false;
            }
            
            if (currentInput.length < 50) {
                currentInput += number;
                updateDisplay();
            }
        }

        function appendDecimal() {
            if (shouldResetInput) {
                currentInput = '0';
                shouldResetInput = false;
            }
            
            if (currentInput === '') {
                currentInput = '0';
            }
            
            // Check if current number already has a decimal
            const lastNumber = currentInput.split(/[+\-*/()^%]/).pop();
            
            if (!lastNumber.includes('.')) {
                currentInput += '.';
                updateDisplay();
            }
        }

        function appendOperator(operator) {
            if (currentInput === '' && operator !== '(' && operator !== '-') return;
            
            shouldResetInput = false;
            
            // Handle different operators
            if (operator === '^2') {
                currentInput += '**2';
            } else if (operator === '^') {
                currentInput += '**';
            } else if (operator === '%') {
                currentInput += '/100';
            } else if (operator === '÷') {
                currentInput += '÷';
            } else if (operator === '×') {
                currentInput += '×';
            } else if (operator === '−') {
                currentInput += '−';
            } else {
                currentInput += operator;
            }
            
            updateDisplay();
        }

        function appendFunction(func) {
            if (shouldResetInput) {
                currentInput = '';
                shouldResetInput = false;
            }
            
            if (func === '!') {
                currentInput += '!';
            } else if (func === 'random()') {
                currentInput += 'Math.random()';
            } else if (func === '1/(') {
                currentInput += '1/(';
            } else {
                // For all other functions, just append them
                currentInput += func;
            }
            
            updateDisplay();
        }

        function appendConstant(constant) {
            if (shouldResetInput) {
                currentInput = '';
                shouldResetInput = false;
            }
            
            if (constant === 'pi') {
                currentInput += 'Math.PI';
            } else if (constant === 'e') {
                currentInput += 'Math.E';
            }
            
            updateDisplay();
        }

        function toRadians(degrees) {
            return degrees * (Math.PI / 180);
        }

        function toDegrees(radians) {
            return radians * (180 / Math.PI);
        }

        function factorial(n) {
            if (n < 0) return NaN;
            if (n === 0 || n === 1) return 1;
            let result = 1;
            for (let i = 2; i <= n; i++) {
                result *= i;
            }
            return result;
        }

        function processExpression(expr) {
            // Handle factorials first
            expr = expr.replace(/(\d+(?:\.\d+)?|\))!/g, (match, num) => {
                const n = parseFloat(num.replace(')', ''));
                return factorial(n).toString();
            });

            // Handle angle conversions for trig functions
            if (angleMode === 'DEG') {
                // For regular trig functions, convert input from degrees to radians
                expr = expr.replace(/Math\.sin\(/g, 'Math.sin(toRadians(');
                expr = expr.replace(/Math\.cos\(/g, 'Math.cos(toRadians(');
                expr = expr.replace(/Math\.tan\(/g, 'Math.tan(toRadians(');
                
                // For inverse trig functions, convert output from radians to degrees
                expr = expr.replace(/Math\.asin\(/g, 'toDegrees(Math.asin(');
                expr = expr.replace(/Math\.acos\(/g, 'toDegrees(Math.acos(');
                expr = expr.replace(/Math\.atan\(/g, 'toDegrees(Math.atan(');
            }

            return expr;
        }

        function balanceParentheses(expr) {
            let openCount = 0;
            let closeCount = 0;
            
            for (let char of expr) {
                if (char === '(') openCount++;
                if (char === ')') closeCount++;
            }
            
            // Add missing closing parentheses
            while (closeCount < openCount) {
                expr += ')';
                closeCount++;
            }
            
            return expr;
        }

        function calculate() {
            if (currentInput === '') return;
            
            try {
                let expression = currentInput;
                
                // Replace display symbols with JavaScript operators
                expression = expression.replace(/÷/g, '/');
                expression = expression.replace(/×/g, '*');
                expression = expression.replace(/−/g, '-');
                
                // Handle constants
                expression = expression.replace(/Math\.PI/g, Math.PI);
                expression = expression.replace(/Math\.E/g, Math.E);
                
                // Handle percentage
                expression = expression.replace(/\/100/g, '/100');
                
                // Handle power operations
                expression = expression.replace(/\*\*/g, '**');
                
                // Handle factorials
                expression = expression.replace(/(\d+(?:\.\d+)?|\))!/g, (match, num) => {
                    const n = parseFloat(num.replace(')', ''));
                    return factorial(Math.floor(n)).toString();
                });
                
                // Handle trigonometric functions based on angle mode
                if (angleMode === 'DEG') {
                    // Convert degrees to radians for trig functions
                    expression = expression.replace(/Math\.sin\(([^)]+)\)/g, (match, angle) => {
                        return `Math.sin((${angle}) * Math.PI / 180)`;
                    });
                    expression = expression.replace(/Math\.cos\(([^)]+)\)/g, (match, angle) => {
                        return `Math.cos((${angle}) * Math.PI / 180)`;
                    });
                    expression = expression.replace(/Math\.tan\(([^)]+)\)/g, (match, angle) => {
                        return `Math.tan((${angle}) * Math.PI / 180)`;
                    });
                    
                    // Convert radians to degrees for inverse trig functions
                    expression = expression.replace(/Math\.asin\(([^)]+)\)/g, (match, value) => {
                        return `(Math.asin(${value}) * 180 / Math.PI)`;
                    });
                    expression = expression.replace(/Math\.acos\(([^)]+)\)/g, (match, value) => {
                        return `(Math.acos(${value}) * 180 / Math.PI)`;
                    });
                    expression = expression.replace(/Math\.atan\(([^)]+)\)/g, (match, value) => {
                        return `(Math.atan(${value}) * 180 / Math.PI)`;
                    });
                }
                
                // Handle reciprocal function
                expression = expression.replace(/1\/\(/g, '1/(');
                
                // Handle random function
                expression = expression.replace(/Math\.random\(\)/g, Math.random());
                
                // Evaluate the expression
                const calculatedResult = Function(`"use strict"; return (${expression})`)();
                
                if (isNaN(calculatedResult) || !isFinite(calculatedResult)) {
                    result = 'Error';
                } else {
                    // Round to prevent floating point precision issues
                    result = parseFloat(calculatedResult.toFixed(10)).toString();
                }
                
                shouldResetInput = true;
            } catch (error) {
                result = 'Error';
                shouldResetInput = true;
            }
            
            updateDisplay();
        }

        function clearAll() {
            currentInput = '';
            result = '0';
            shouldResetInput = false;
            updateDisplay();
        }

        function deleteLast() {
            if (currentInput.length > 0) {
                currentInput = currentInput.slice(0, -1);
                updateDisplay();
            }
        }

        function changeSign() {
            if (result !== '0' && result !== 'Error') {
                if (result.startsWith('-')) {
                    result = result.substring(1);
                } else {
                    result = '-' + result;
                }
                currentInput = result;
                updateDisplay();
            }
        }

        function toggleAngleMode() {
            angleMode = angleMode === 'DEG' ? 'RAD' : 'DEG';
            document.querySelector('.btn-function[onclick="toggleAngleMode()"]').textContent = angleMode;
            updateDisplay();
        }

        // Memory functions
        function memoryRecall() {
            currentInput = memory.toString();
            shouldResetInput = true;
            updateDisplay();
        }

        function memoryAdd() {
            if (result !== 'Error' && result !== '0') {
                memory += parseFloat(result);
                updateDisplay();
            }
        }

        function memorySubtract() {
            if (result !== 'Error' && result !== '0') {
                memory -= parseFloat(result);
                updateDisplay();
            }
        }

        function memoryClear() {
            memory = 0;
            updateDisplay();
        }

        // Enhanced keyboard support
        document.addEventListener('keydown', function(event) {
            const key = event.key;
            
            if (key >= '0' && key <= '9') {
                appendNumber(key);
            } else if (key === '.') {
                appendDecimal();
            } else if (['+', '-', '*', '/'].includes(key)) {
                appendOperator(key);
            } else if (key === '(' || key === ')') {
                appendOperator(key);
            } else if (key === 'Enter' || key === '=') {
                event.preventDefault();
                calculate();
            } else if (key === 'Escape') {
                clearAll();
            } else if (key === 'Backspace') {
                event.preventDefault();
                deleteLast();
            } else if (key.toLowerCase() === 'p') {
                appendConstant('pi');
            } else if (key.toLowerCase() === 'e') {
                appendConstant('e');
            }
        });

        // Initialize display
        updateDisplay();