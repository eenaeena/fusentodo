document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggleBtn');
    const board = document.getElementById('board');
    const noteInput = document.getElementById('noteInput');
    const addBtn = document.getElementById('addBtn');
    const notesContainer = document.getElementById('notesContainer');

    let notes = JSON.parse(localStorage.getItem('fusentodo_notes')) || [];

    // Initialize
    renderNotes();

    // Toggle Board
    toggleBtn.addEventListener('click', () => {
        board.classList.toggle('hidden');
        if (board.classList.contains('hidden')) {
            toggleBtn.innerHTML = '<i class="fas fa-sticky-note"></i>';
            toggleBtn.classList.remove('active');
        } else {
            toggleBtn.innerHTML = '<i class="fas fa-times"></i>';
            toggleBtn.classList.add('active');
            noteInput.focus();
        }
    });

    // Add Note
    addBtn.addEventListener('click', () => {
        const text = noteInput.value.trim();
        if (text) {
            addNote(text);
            noteInput.value = '';
            noteInput.focus();
        }
    });

    // Allow Enter to add (Shift+Enter for new line)
    noteInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addBtn.click();
        }
    });

    function addNote(text) {
        const now = new Date();
        const note = {
            id: Date.now().toString(),
            text: text,
            timestamp: now.toLocaleString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
        };
        notes.unshift(note); // Add to beginning
        saveNotes();
        renderNotes();
    }

    function saveNotes() {
        localStorage.setItem('fusentodo_notes', JSON.stringify(notes));
    }

    function renderNotes() {
        notesContainer.innerHTML = '';
        notes.forEach(note => {
            const noteEl = document.createElement('div');
            noteEl.className = 'note';
            noteEl.innerHTML = `
                <div class="note-text">${escapeHTML(note.text)}</div>
                <div class="note-footer">
                    <span class="timestamp">${note.timestamp}</span>
                    <button class="delete-btn" data-id="${note.id}" aria-label="Delete Note">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            notesContainer.appendChild(noteEl);
        });

        // Attach event listeners to new delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const noteEl = e.target.closest('.note');
                const id = e.currentTarget.dataset.id;
                deleteNote(id, noteEl);
            });
        });
    }

    function deleteNote(id, element) {
        // Play exit animation
        element.classList.add('fade-out');
        element.addEventListener('animationend', () => {
            notes = notes.filter(n => n.id !== id);
            saveNotes();
            renderNotes();
        });
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
});
