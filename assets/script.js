// Estado de la aplicación
        const state = {
            notes: [],
            currentNoteId: null,
            theme: 'light'
        };

        // Elementos del DOM
        const elements = {
            notesList: document.getElementById('notes-list'),
            markdownEditor: document.getElementById('markdown-editor'),
            markdownPreview: document.getElementById('markdown-preview'),
            addNoteBtn: document.getElementById('add-note-btn'),
            themeToggle: document.getElementById('theme-toggle'),
            currentNoteTitle: document.getElementById('current-note-title'),
            splitter: document.getElementById('splitter'),
            editorContainer: document.querySelector('.editor-container'),
            previewContainer: document.querySelector('.preview-container')
        };

        // Inicialización
        function init() {
            // Cargar notas desde localStorage
            loadNotes();
            
            // Configurar event listeners
            setupEventListeners();
            
            // Configurar resaltado de sintaxis
            hljs.highlightAll();
            
            // Configurar marked.js
            marked.setOptions({
                breaks: true,
                highlight: function(code, lang) {
                    if (hljs.getLanguage(lang)) {
                        return hljs.highlight(lang, code).value;
                    }
                    return hljs.highlightAuto(code).value;
                }
            });
            
            // Crear una nota inicial si no hay ninguna
            if (state.notes.length === 0) {
                createNewNote();
            } else {
                loadNote(state.notes[0].id);
            }
        }

        // Cargar notas desde localStorage
        function loadNotes() {
            const savedNotes = localStorage.getItem('markdown-notes');
            if (savedNotes) {
                state.notes = JSON.parse(savedNotes);
                renderNotesList();
            }
        }

        // Guardar notas en localStorage
        function saveNotes() {
            localStorage.setItem('markdown-notes', JSON.stringify(state.notes));
        }

        // Renderizar la lista de notas
        function renderNotesList() {
            elements.notesList.innerHTML = '';
            
            state.notes.forEach(note => {
                const li = document.createElement('li');
                li.className = 'note-item';
                if (note.id === state.currentNoteId) {
                    li.classList.add('active');
                }
                
                // Extraer el primer título para mostrar como nombre de la nota
                const titleMatch = note.content.match(/^#\s(.+)$/m);
                const title = titleMatch ? titleMatch[1] : 'Nota sin título';
                
                li.textContent = title;
                li.dataset.noteId = note.id;
                
                li.addEventListener('click', () => loadNote(note.id));
                
                elements.notesList.appendChild(li);
            });
        }

        // Crear una nueva nota
        function createNewNote() {
            const newNote = {
                id: Date.now().toString(),
                content: '# Nueva Nota\n\nEscribe tu contenido aquí...\n\n```javascript\nconsole.log("Hola Mundo");\n```',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            state.notes.unshift(newNote);
            saveNotes();
            loadNote(newNote.id);
            renderNotesList();
        }

        // Cargar una nota en el editor
        function loadNote(noteId) {
            const note = state.notes.find(n => n.id === noteId);
            if (!note) return;
            
            state.currentNoteId = noteId;
            elements.markdownEditor.value = note.content;
            updatePreview();
            renderNotesList();
            
            // Extraer el título para mostrarlo
            const titleMatch = note.content.match(/^#\s(.+)$/m);
            elements.currentNoteTitle.textContent = titleMatch ? titleMatch[1] : 'Nota sin título';
        }

        // Actualizar la vista previa
        function updatePreview() {
            const markdown = elements.markdownEditor.value;
            elements.markdownPreview.innerHTML = marked.parse(markdown);
            
            // Volver a aplicar el resaltado de sintaxis
            document.querySelectorAll('pre code').forEach(block => {
                hljs.highlightElement(block);
            });
            
            // Actualizar la nota en el estado
            const noteIndex = state.notes.findIndex(n => n.id === state.currentNoteId);
            if (noteIndex !== -1) {
                state.notes[noteIndex].content = markdown;
                state.notes[noteIndex].updatedAt = new Date().toISOString();
                saveNotes();
                renderNotesList();
            }
        }

        // Cambiar tema
        function toggleTheme() {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
            document.body.classList.toggle('dark-theme');
            
            // Cambiar el tema de highlight.js
            const link = document.querySelector('link[href*="highlight.js"]');
            if (state.theme === 'dark') {
                link.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github-dark.min.css';
            } else {
                link.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github.min.css';
            }
            
            // Volver a aplicar el resaltado
            document.querySelectorAll('pre code').forEach(block => {
                hljs.highlightElement(block);
            });
        }

        // Configurar el redimensionamiento del splitter
        function setupSplitter() {
            let isDragging = false;
            
            elements.splitter.addEventListener('mousedown', (e) => {
                isDragging = true;
                document.body.classList.add('resizing');
                e.preventDefault();
            });
            
            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                
                const containerWidth = document.querySelector('.editor-preview-container').offsetWidth;
                const editorWidth = e.clientX - elements.editorContainer.getBoundingClientRect().left;
                const percentage = (editorWidth / containerWidth) * 100;
                
                elements.editorContainer.style.flex = `0 0 ${percentage}%`;
                elements.previewContainer.style.flex = `0 0 ${100 - percentage}%`;
            });
            
            document.addEventListener('mouseup', () => {
                isDragging = false;
                document.body.classList.remove('resizing');
            });
        }

        // Configurar event listeners
        function setupEventListeners() {
            // Editor de markdown
            elements.markdownEditor.addEventListener('input', () => {
                updatePreview();
            });
            
            // Botón de nueva nota
            elements.addNoteBtn.addEventListener('click', createNewNote);
            
            // Cambiar tema
            elements.themeToggle.addEventListener('click', toggleTheme);
            
            // Configurar splitter
            setupSplitter();
        }

        // Iniciar la aplicación
        document.addEventListener('DOMContentLoaded', init);