// chatModule.js - версия с поддержкой стриминга
export function initializeChat() {
    // DOM elements
    const textarea = document.querySelector('.message-input');
    const plusBtn = document.querySelector('.plus-btn');
    const voiceBtn = document.getElementById('voiceBtn');
    const sendBtn = document.getElementById('sendBtn');
    const searchBtn = document.getElementById('searchBtn');
    const thinkBtn = document.getElementById('thinkBtn');
    const brainstormBtn = document.getElementById('brainstormBtn');
    const codeBtn = document.getElementById('codeBtn');
    const summarizeBtn = document.getElementById('summarizeBtn');
    const consultBtn = document.getElementById('consultBtn');
    const moreBtn = document.getElementById('moreBtn');
    const container = document.querySelector('.container');
    const chatContainer = document.querySelector('.chat-container');
    const helpTextContainer = document.querySelector('.help-text-container');
    const buttonsContainer = document.querySelector('.buttons-container');

    let singleLineHeight;
    let isActiveChat = false;
    let isStreaming = false;

    // API конфигурация
    const API_KEY = 'sk-ebb7e88909cf41c88c6ae0eb718133c8';
    const API_URL = 'https://api.deepseek.com/chat/completions';
    
    // История разговора
// История разговора
let conversationHistory = [
    {
        role: "system",
        content: "Ты — универсальный, сверхумный и харизматичный ИИ-ассистент, созданный, чтобы быть лучшим помощником во всех сферах жизни. Твоя задача — давать точные, профессиональные и полезные ответы на русском языке, сохраняя современный, дерзкий, но тактичный и приятный стиль общения. Используй простой, живой и доступный язык, как будто ты умный человек, который говорит кратко, по существу и естественно, не выделяясь излишне. \n\n" +
                 "Твои ответы должны быть:\n" +
                 "- **Краткими и по существу**: Отвечай чётко, без лишних слов, но с сохранением всей необходимой информации.\n" +
                 "- **Профессиональными**: Ты эксперт во всех областях — от науки и технологий до поп-культуры и бытовых вопросов. Давай глубокие и точные ответы, подкрепленные фактами, но без занудства.\n" +
                 "- **Современными и дерзкими**: Используй актуальный сленг, мемы и лёгкую иронию, но оставайся тактичным и уважительным. Не переходи границы, чтобы не обидеть пользователя.\n" +
                 "- **Простыми и понятными**: Объясняй сложные темы так, будто рассказываешь другу за кофе. Избегай сложных терминов, если можно сказать проще, но не теряй сути.\n" +
                 "- **Суперобщительными**: Будь харизматичным, добавляй немного юмора и позитива, чтобы пользователь чувствовал себя комфортно. Поддерживай диалог, задавай уточняющие вопросы, если это уместно, чтобы лучше понять запрос.\n" +
                 "- **Универсальными**: Ты готов помочь с любым вопросом — от решения математических задач до советов по стилю или разбору квантовой физики. Если нужно, подключай аналитические способности, креативность или эмпатию.\n" +
                 "- **Проактивными**: Предлагай дополнительные идеи, лайфхаки или полезные советы, если это уместно, чтобы пользователь получил больше, чем ожидал.\n\n" +
                 "Ты можешь анализировать контекст, учитывать эмоции пользователя и адаптировать тон, чтобы быть максимально полезным. Если запрос требует поиска информации, используй доступные тебе инструменты (например, веб-поиск или анализ данных), но всегда проверяй факты и избегай выдумок. Если пользователь просит что-то творческое, вроде генерации текста или идей, добавляй искру креатива, но держи баланс между дерзостью и профессионализмом.\n\n" +
                 "Пример стиля ответа: «Бро, блокчейн? Это как общий дневник, который не подделать. Хочешь глубже копнуть или что-то ещё разжевать?»\n\n" +
                 "Ты — лучший друг и профи в одном лице. Помогай, вдохновляй и делай так, чтобы пользователь всегда уходил с улыбкой и ответом, который решает его задачу!"
    }
];

    // Функция для преобразования Markdown в HTML
    function parseMarkdown(text) {
        let html = text;
        
        // Заголовки
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        // Жирный текст
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
        
        // Курсив
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/_(.*?)_/g, '<em>$1</em>');
        
        // Код (инлайн)
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Блоки кода
        html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        
        // Списки
        html = html.replace(/^\* (.+)$/gm, '<li>$1</li>');
        html = html.replace(/^\- (.+)$/gm, '<li>$1</li>');
        html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
        
        // Обертываем списки в ul/ol
        html = html.replace(/((<li>.*<\/li>\s*)+)/g, '<ul>$1</ul>');
        
        // Ссылки
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // Переносы строк
        html = html.replace(/\n\n/g, '</p><p>');
        html = html.replace(/\n/g, '<br>');
        
        // Обертываем в параграфы
        if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<pre')) {
            html = '<p>' + html + '</p>';
        }
        
        return html;
    }

    // Функция для отправки запроса к DeepSeek API с поддержкой стриминга
    async function sendToDeepSeekStream(message, messageElement) {
        if (isStreaming) return;
        
        try {
            isStreaming = true;
            conversationHistory.push({ role: "user", content: message });

            // Показываем красивый индикатор загрузки
            messageElement.innerHTML = `
                <div class="ai-thinking">
                    <div class="thinking-dots">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                </div>
            `;

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: conversationHistory,
                    stream: true, // Включаем стриминг
                    temperature: 1.3,
                    max_tokens: 8192
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiResponse = '';
            let firstTokenReceived = false;

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') {
                            isStreaming = false;
                            break;
                        }

                        try {
                            const parsed = JSON.parse(data);
                            const delta = parsed.choices?.[0]?.delta?.content;
                            
                            if (delta) {
                                // При получении первого токена убираем индикатор загрузки
                                if (!firstTokenReceived) {
                                    firstTokenReceived = true;
                                    messageElement.innerHTML = '';
                                    messageElement.classList.add('streaming-text');
                                }
                                
                                aiResponse += delta;
                                // Обновляем HTML с поддержкой Markdown
                                messageElement.innerHTML = parseMarkdown(aiResponse);
                                // Автоскролл к низу чата
                                chatContainer.scrollTop = chatContainer.scrollHeight;
                            }
                        } catch (e) {
                            // Игнорируем ошибки парсинга JSON
                            continue;
                        }
                    }
                }
            }

            // Финальное форматирование и очистка
            messageElement.classList.remove('streaming-text');
            messageElement.innerHTML = parseMarkdown(aiResponse);
            
            // Добавляем полный ответ в историю разговора
            conversationHistory.push({ role: "assistant", content: aiResponse });
            isStreaming = false;
            return aiResponse;

        } catch (error) {
            console.error('Ошибка API:', error);
            isStreaming = false;
            const errorMessage = `Извините, произошла ошибка: ${error.message}`;
            messageElement.innerHTML = `<span class="error-message">${errorMessage}</span>`;
            return errorMessage;
        }
    }

    // Auto-resize textarea based on content
    function autoResize() {
        const content = textarea.value;
        
        textarea.style.height = 'auto';
        const currentScrollHeight = textarea.scrollHeight;
        const lineCount = content.split('\n').length;
        const isMultiline = lineCount > 1 || content.includes('\n') || (currentScrollHeight > singleLineHeight && content.trim().length > 0);
        
        if (!isMultiline || content.trim().length === 0) {
            textarea.style.padding = '15px 50px 15px 130px';
        } else {
            textarea.style.padding = '15px 20px 50px 20px';
        }
        
        textarea.style.height = content.trim().length === 0 ? `${singleLineHeight}px` : `${textarea.scrollHeight}px`;
        
        const hasText = content.trim().length > 0;
        if (hasText) {
            voiceBtn.classList.add('hidden');
            sendBtn.classList.add('visible');
        } else {
            voiceBtn.classList.remove('hidden');
            sendBtn.classList.remove('visible');
        }
    }

    // Toggle chat state (show/hide help text and buttons)
    function toggleChatState() {
        isActiveChat = true;
        container.classList.add('active-chat');
        helpTextContainer.style.display = 'none';
        buttonsContainer.style.display = 'none';
        chatContainer.style.display = 'flex';
        autoResize();
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Handle sending a message
    async function handleSendClick() {
        if (isStreaming) return; // Предотвращаем отправку во время стриминга
        
        const content = textarea.value.trim();
        if (content) {
            const lines = content.split('\n').filter(line => line.trim().length > 0);
            const wrappedLines = [];

            lines.forEach(line => {
                let remaining = line.trim();
                while (remaining.length > 63) {
                    let slicePoint = remaining.slice(0, 63).lastIndexOf(' ');
                    if (slicePoint === -1 || slicePoint < 30) {
                        slicePoint = 63;
                    }
                    wrappedLines.push(remaining.slice(0, slicePoint).trim());
                    remaining = remaining.slice(slicePoint).trim();
                }
                if (remaining.length > 0) {
                    wrappedLines.push(remaining);
                }
            });

            const wrappedContent = wrappedLines.join('\n');

            // Добавляем сообщение пользователя
            const userMessage = document.createElement('div');
            userMessage.classList.add('message', 'user-message');
            userMessage.textContent = wrappedContent;
            chatContainer.appendChild(userMessage);

            // Создаем пустое сообщение бота для стриминга
            const botMessage = document.createElement('div');
            botMessage.classList.add('message', 'bot-message');
            botMessage.innerHTML = `
                <div class="ai-thinking">
                    <div class="thinking-dots">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                </div>
            `;
            chatContainer.appendChild(botMessage);

            if (!isActiveChat) {
                toggleChatState();
            } else {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }

            textarea.value = '';
            autoResize();

            // Блокируем кнопку отправки во время стриминга
            sendBtn.classList.add('sending');
            sendBtn.disabled = true;

            // Получаем ответ от API с стримингом
            await sendToDeepSeekStream(content, botMessage);
            
            // Разблокируем кнопку отправки
            sendBtn.classList.remove('sending');
            sendBtn.disabled = false;
            
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    // Обработка предустановленных кнопок с поддержкой стриминга
    async function handlePresetButton(promptText, buttonName) {
        if (isStreaming) return; // Предотвращаем отправку во время стриминга
        
        if (!isActiveChat) {
            toggleChatState();
        }

        // Показываем что пользователь нажал кнопку
        const userMessage = document.createElement('div');
        userMessage.classList.add('message', 'user-message', 'preset-message');
        userMessage.textContent = `🎯 ${buttonName}`;
        chatContainer.appendChild(userMessage);

        // Создаем пустое сообщение бота для стриминга
        const botMessage = document.createElement('div');
        botMessage.classList.add('message', 'bot-message');
        botMessage.innerHTML = `
            <div class="ai-thinking">
                <div class="thinking-dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        `;
        chatContainer.appendChild(botMessage);

        chatContainer.scrollTop = chatContainer.scrollHeight;

        // Получаем ответ от API с стримингом
        await sendToDeepSeekStream(`${promptText}[Пользователь нажал кнопку "${buttonName}"]`, botMessage);
        
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Handle Enter key press for sending messages
    function handleEnterKey(event) {
        if (event.key === 'Enter' && !event.shiftKey && !isStreaming) {
            event.preventDefault();
            handleSendClick();
        }
    }

    // Button handlers
    function handlePlusClick() {
        console.log('Plus button clicked');
    }

    function handleVoiceClick() {
        console.log('Voice button clicked');
    }

    function handleSearchClick() {
        console.log('Search button clicked - поиск в интернете пока не реализован');
    }

    function handleThinkClick() {
        console.log('Think button clicked - режим рассуждения пока не реализован');
    }

    function handleBrainstormClick() {
        handlePresetButton('Давайте проведем мозговой штурм по теме: ', 'Мозговой штурм');
    }

    function handleCodeClick() {
        handlePresetButton('Помогите мне с кодом: ', 'Код');
    }

    function handleSummarizeClick() {
        handlePresetButton('Пожалуйста, обобщите следующую информацию: ', 'Обобщение');
    }

    function handleConsultClick() {
        handlePresetButton('Мне нужна консультация по вопросу: ', 'Консультация');
    }

    function handleMoreClick() {
        console.log('More button clicked');
    }

    // Attach event listeners
    textarea.addEventListener('input', autoResize);
    textarea.addEventListener('keydown', (e) => {
        setTimeout(autoResize, 0);
        handleEnterKey(e);
    });
    plusBtn.addEventListener('click', handlePlusClick);
    voiceBtn.addEventListener('click', handleVoiceClick);
    sendBtn.addEventListener('click', handleSendClick);
    searchBtn.addEventListener('click', handleSearchClick);
    thinkBtn.addEventListener('click', handleThinkClick);
    brainstormBtn.addEventListener('click', handleBrainstormClick);
    codeBtn.addEventListener('click', handleCodeClick);
    summarizeBtn.addEventListener('click', handleSummarizeClick);
    consultBtn.addEventListener('click', handleConsultClick);
    moreBtn.addEventListener('click', handleMoreClick);


    // Initialize textarea height
    const originalValue = textarea.value;
    textarea.value = 'test';
    autoResize();
    singleLineHeight = textarea.scrollHeight;
    textarea.value = originalValue;
    autoResize();
}
