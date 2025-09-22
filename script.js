let currentInput = '';
        let result = '0';
        let shouldResetInput = false;
        let angleMode = 'DEG'; // DEG or RAD
        let memory = 0;

        const inputDisplay = document.getElementById('input');
        const resultDisplay = document.getElementById('result');
        const modeDisplay = document.getElementById('mode');

        function updateDisplay() {
            // Update input display with fallback for empty input
            inputDisplay.textContent = currentInput || '0';
            
            // Format result based on its type and magnitude
            if (typeof result === 'number') {
                if (Number.isInteger(result) && Math.abs(result) < 1e10) {
                    resultDisplay.textContent = result.toString();
                } else {
                    resultDisplay.textContent = result.toExponential(6);
                }
            } else {
                resultDisplay.textContent = result || '0';
            }
            
            // Format memory display with conditional visibility
            const memoryText = memory !== 0 ? `M: ${formatNumber(memory)}` : '';
            modeDisplay.textContent = `${angleMode}${memoryText ? ' | ' + memoryText : ''}`;
        }
        
        // Helper function for consistent number formatting
        function formatNumber(num) {
            if (Math.abs(num) < 0.01 || Math.abs(num) >= 1e6) {
                return num.toExponential(2);
            }
            return num.toFixed(2);
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

        // Speech Recognition variables
        let recognition = null;
        let isListening = false;
        let speechSupported = false;

        // Check if speech recognition is supported
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            speechSupported = true;
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = function() {
                isListening = true;
                const speechBtn = document.getElementById('speechBtn');
                if (speechBtn) {
                    speechBtn.classList.add('listening');
                    speechBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
                    speechBtn.title = 'Listening... (Click to stop)';
                }
                console.log('Speech recognition started');
            };

            recognition.onresult = function(event) {
                const transcript = event.results[0][0].transcript.toLowerCase().trim();
                console.log('Speech result:', transcript);
                processVoiceInput(transcript);
            };

            recognition.onerror = function(event) {
                console.error('Speech recognition error:', event.error);
                isListening = false;
                const speechBtn = document.getElementById('speechBtn');
                if (speechBtn) {
                    speechBtn.classList.remove('listening');
                    speechBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                    speechBtn.title = 'Voice Input (Press S)';
                }
                alert('Speech recognition error: ' + event.error);
            };

            recognition.onend = function() {
                isListening = false;
                const speechBtn = document.getElementById('speechBtn');
                if (speechBtn) {
                    speechBtn.classList.remove('listening');
                    speechBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                    speechBtn.title = 'Voice Input (Press S)';
                }
                console.log('Speech recognition ended');
            };
        }

        function processVoiceInput(transcript) {
            console.log('Processing voice input:', transcript);

            // Enhanced number word mapping with compound numbers
            const numberWords = {
                'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
                'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
                'ten': '10', 'eleven': '11', 'twelve': '12', 'thirteen': '13',
                'fourteen': '14', 'fifteen': '15', 'sixteen': '16', 'seventeen': '17',
                'eighteen': '18', 'nineteen': '19', 'twenty': '20', 'thirty': '30',
                'forty': '40', 'fifty': '50', 'sixty': '60', 'seventy': '70',
                'eighty': '80', 'ninety': '90', 'hundred': '100', 'thousand': '1000'
            };

            // Enhanced operator mapping with more variations
            const operatorWords = {
                'plus': '+', 'add': '+', 'addition': '+', 'and': '+',
                'minus': '-', 'subtract': '-', 'subtraction': '-', 'take away': '-',
                'times': '*', 'multiply': '*', 'multiplied by': '*', 'multiplication': '*', 'of': '*',
                'divided by': '/', 'divide': '/', 'division': '/', 'over': '/',
                'equals': '=', 'equal': '=', 'result': '=', 'is': '=', 'makes': '=',
                'power': '^', 'to the power of': '^', 'raised to': '^', 'exponent': '^',
                'squared': '^2', 'cubed': '^3', 'square root of': '√',
                'percent': '%', 'percentage': '%', 'mod': '%', 'modulo': '%',
                'open parenthesis': '(', 'close parenthesis': ')',
                'left parenthesis': '(', 'right parenthesis': ')',
                'open bracket': '(', 'close bracket': ')'
            };

            // Enhanced function mapping with more comprehensive terms
            const functionWords = {
                'sine': 'sin', 'sin': 'sin', 'cosine': 'cos', 'cos': 'cos',
                'tangent': 'tan', 'tan': 'tan', 'arc sine': 'sin⁻¹', 'inverse sine': 'sin⁻¹',
                'arc cosine': 'cos⁻¹', 'inverse cosine': 'cos⁻¹', 'arc tangent': 'tan⁻¹',
                'inverse tangent': 'tan⁻¹', 'square root': '√', 'square root of': '√',
                'logarithm': 'log', 'log': 'log', 'natural log': 'ln', 'ln': 'ln',
                'factorial': '!', 'reciprocal': '1/x', 'one over': '1/',
                'absolute value': '|x|', 'absolute': '|x|', 'modulus': '|x|',
                'exponential': 'eˣ', 'exp': 'eˣ', 'e to the power': 'e^',
                'ten to the power': '10ˣ', 'ten to the': '10^', 'pi': 'π', 'π': 'π',
                'euler': 'e', 'e': 'e', 'random': 'Rand', 'random number': 'Rand'
            };

            // Special commands with more variations
            const specialCommands = {
                'clear': 'clear', 'clear all': 'clear', 'reset': 'clear', 'start over': 'clear',
                'delete': 'delete', 'backspace': 'delete', 'remove': 'delete',
                'calculate': 'calculate', 'compute': 'calculate', 'solve': 'calculate',
                'memory recall': 'MR', 'memory read': 'MR', 'recall memory': 'MR',
                'memory add': 'M+', 'memory plus': 'M+', 'add to memory': 'M+',
                'memory subtract': 'M-', 'memory minus': 'M-', 'subtract from memory': 'M-',
                'memory clear': 'MC', 'clear memory': 'MC', 'reset memory': 'MC',
                'toggle degrees': 'DEG', 'toggle radians': 'RAD', 'switch to degrees': 'DEG',
                'switch to radians': 'RAD', 'degrees mode': 'DEG', 'radians mode': 'RAD'
            };

            let processed = false;

            // Check for special commands first (most specific to least specific)
            for (const [word, command] of Object.entries(specialCommands)) {
                if (transcript.includes(word)) {
                    handleSpecialCommand(command);
                    processed = true;
                    break;
                }
            }

            if (processed) return;

            // Advanced parsing for mathematical expressions
            let processedTranscript = transcript.toLowerCase().trim();

            // Handle compound numbers (e.g., "twenty five" -> "25")
            processedTranscript = processedTranscript.replace(/(\b(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\b)\s+(\b(?:one|two|three|four|five|six|seven|eight|nine)\b)/g,
                (match, tens, units) => {
                    return (parseInt(numberWords[tens]) + parseInt(numberWords[units])).toString();
                });

            // Handle hundreds (e.g., "two hundred" -> "200")
            processedTranscript = processedTranscript.replace(/(\b(?:one|two|three|four|five|six|seven|eight|nine)\b)\s+hundred/g,
                (match, hundreds) => {
                    return (parseInt(numberWords[hundreds]) * 100).toString();
                });

            // Handle "point" for decimals (e.g., "three point five" -> "3.5")
            processedTranscript = processedTranscript.replace(/(\d+)\s+point\s+(\d+)/g, '$1.$2');

            // Replace number words with digits
            for (const [word, number] of Object.entries(numberWords)) {
                const regex = new RegExp(`\\b${word}\\b`, 'g');
                processedTranscript = processedTranscript.replace(regex, number);
            }

            // Replace operator words with symbols
            for (const [word, operator] of Object.entries(operatorWords)) {
                const regex = new RegExp(`\\b${word}\\b`, 'g');
                processedTranscript = processedTranscript.replace(regex, operator);
            }

            // Replace function words with calculator notation
            for (const [word, func] of Object.entries(functionWords)) {
                const regex = new RegExp(`\\b${word}\\b`, 'g');
                processedTranscript = processedTranscript.replace(regex, func);
            }

            // Clean up extra whitespace and normalize
            processedTranscript = processedTranscript.replace(/\s+/g, ' ').trim();
            processedTranscript = processedTranscript.replace(/\s*([+\-*/^()])\s*/g, '$1');

            console.log('Advanced processed transcript:', processedTranscript);

            // Try to parse and execute the processed input
            if (processedTranscript) {
                try {
                    // Handle direct number input
                    if (/^\d+\.?\d*$/.test(processedTranscript)) {
                        appendNumber(processedTranscript);
                    }
                    // Handle simple operators
                    else if (processedTranscript.length === 1 && '+-*/=()'.includes(processedTranscript)) {
                        appendOperator(processedTranscript);
                    }
                    // Handle special commands that weren't caught earlier
                    else if (processedTranscript === 'clear' || processedTranscript === 'delete') {
                        if (processedTranscript === 'clear') {
                            clearAll();
                        } else {
                            deleteLast();
                        }
                    }
                    else if (processedTranscript === 'calculate' || processedTranscript === '=') {
                        calculate();
                    }
                    // Handle complex expressions by appending to current input
                    else {
                        if (shouldResetInput) {
                            currentInput = '';
                            shouldResetInput = false;
                        }
                        if (currentInput.length < 50) {
                            currentInput += processedTranscript;
                            updateDisplay();
                        }
                    }
                } catch (error) {
                    console.error('Error processing voice input:', error);
                    // Try to append the original transcript if processing failed
                    if (shouldResetInput) {
                        currentInput = '';
                        shouldResetInput = false;
                    }
                    if (currentInput.length < 50) {
                        currentInput += transcript;
                        updateDisplay();
                    }
                }
            }
        }

        function handleSpecialCommand(command) {
            switch(command) {
                case 'clear':
                    clearAll();
                    break;
                case 'delete':
                    deleteLast();
                    break;
                case 'calculate':
                    calculate();
                    break;
                case 'MR':
                    memoryRecall();
                    break;
                case 'M+':
                    memoryAdd();
                    break;
                case 'M-':
                    memorySubtract();
                    break;
                case 'MC':
                    memoryClear();
                    break;
                case 'DEG':
                case 'RAD':
                    toggleAngleMode();
                    break;
            }
        }

        function startSpeechRecognition() {
            if (!speechSupported) {
                alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
                return;
            }

            if (!isListening) {
                try {
                    recognition.start();
                } catch (error) {
                    console.error('Error starting speech recognition:', error);
                    alert('Error starting speech recognition. Please try again.');
                }
            } else {
                recognition.stop();
            }
        }

        // Enhanced keyboard support with speech recognition key
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
            } else if (key.toLowerCase() === 's') {
                // 'S' key for speech recognition
                event.preventDefault();
                startSpeechRecognition();
            }
        });

        // Initialize display
        updateDisplay();
