        let currentInput = '';
        let result = '0';
        let shouldResetInput = false;

        const inputDisplay = document.getElementById('input');
        const resultDisplay = document.getElementById('result');

        function updateDisplay() {
            inputDisplay.textContent = currentInput;
            resultDisplay.textContent = result;
        }

        function appendNumber(number) {
            if (shouldResetInput) {
                currentInput = '';
                shouldResetInput = false;
            }
            
            if (currentInput.length < 20) {
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
            const parts = currentInput.split(/[+\-*/]/);
            const lastPart = parts[parts.length - 1];
            
            if (!lastPart.includes('.')) {
                currentInput += '.';
                updateDisplay();
            }
        }

        function appendOperator(operator) {
            if (currentInput === '') return;
            
            shouldResetInput = false;
            
            // Replace operator if last character is an operator
            const lastChar = currentInput[currentInput.length - 1];
            if (['+', '-', '*', '/'].includes(lastChar)) {
                currentInput = currentInput.slice(0, -1) + operator;
            } else {
                currentInput += operator;
            }
            
            updateDisplay();
        }

        function calculate() {
            if (currentInput === '') return;
            
            try {
                // Replace display operators with JavaScript operators
                let expression = currentInput
                    .replace(/÷/g, '/')
                    .replace(/×/g, '*')
                    .replace(/−/g, '-');
                
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

        function clearEntry() {
            result = '0';
            updateDisplay();
        }

        function deleteLast() {
            if (currentInput.length > 0) {
                currentInput = currentInput.slice(0, -1);
                updateDisplay();
            }
        }

        // Keyboard support
        document.addEventListener('keydown', function(event) {
            const key = event.key;
            
            if (key >= '0' && key <= '9') {
                appendNumber(key);
            } else if (key === '.') {
                appendDecimal();
            } else if (['+', '-', '*', '/'].includes(key)) {
                appendOperator(key);
            } else if (key === 'Enter' || key === '=') {
                event.preventDefault();
                calculate();
            } else if (key === 'Escape') {
                clearAll();
            } else if (key === 'Backspace') {
                event.preventDefault();
                deleteLast();
            }
        });

        // Initialize display
        updateDisplay();