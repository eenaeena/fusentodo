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
            noteInput.style.height = 'auto'; // 追加後に高さをリセットする
            noteInput.focus();
        }
    });

    // テキストエリアの自動リサイズ（文字数に合わせて広がる）
    noteInput.addEventListener('input', function() {
        this.style.height = 'auto'; // 一旦リセット
        this.style.height = (this.scrollHeight) + 'px'; // 中身の高さに合わせる
    });

    // Allow Enter to add (Shift+Enter for new line)
    noteInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addBtn.click();
        }
    });

    function addNote(text) {
        if (!text) return; // 空の場合は追加しない

        const now = new Date();
        const note = {
            id: Date.now().toString(),
            text: text,
            checked: false, // 1付箋につき1つのチェック状態
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
        notes.forEach((note, index) => {
            // 後方互換性：linesがあるフォーマットを元のtextフォーマットに直す
            if (note.lines && !note.text) {
                note.text = note.lines.map(l => l.text).join('\n');
                note.checked = note.lines.some(l => l.checked);
                delete note.lines;
            }

            // 万が一checkedフィールドが無い古いデータなら初期化
            if (typeof note.checked === 'undefined') {
                note.checked = false;
            }

            const noteNumber = notes.length - index;
            const noteEl = document.createElement('div');
            noteEl.className = 'note';
            if (note.checked) {
                noteEl.classList.add('is-note-checked');
            }
            
            const checkedAttr = note.checked ? 'checked' : '';

            noteEl.innerHTML = `
                <div class="note-header note-checkbox-wrapper">
                    <label>
                        <input type="checkbox" class="note-checkbox" data-note-id="${note.id}" ${checkedAttr}>
                        <span class="note-number">${noteNumber}番めの付箋</span>
                    </label>
                </div>
                <div class="note-content">
                    <div class="note-text">${escapeHTML(note.text)}</div>
                </div>
                <div class="note-footer">
                    <span class="timestamp">${note.timestamp}</span>
                    <button class="delete-btn" data-id="${note.id}" aria-label="Delete Note">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            notesContainer.appendChild(noteEl);
        });

        // Deleteボタンのリスナー
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const noteEl = e.target.closest('.note');
                const id = e.currentTarget.dataset.id;
                deleteNote(id, noteEl);
            });
        });

        // チェックボックスのリスナー（1付箋1チェック）
        document.querySelectorAll('.note-checkbox').forEach(box => {
            box.addEventListener('change', (e) => {
                const noteId = e.target.dataset.noteId;
                const isChecked = e.target.checked;
                
                const targetNote = notes.find(n => n.id === noteId);
                if (targetNote) {
                    targetNote.checked = isChecked;
                    saveNotes();
                    const noteEl = e.target.closest('.note');
                    if (isChecked) {
                        noteEl.classList.add('is-note-checked');
                    } else {
                        noteEl.classList.remove('is-note-checked');
                    }
                }
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
