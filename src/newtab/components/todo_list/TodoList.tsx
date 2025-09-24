import React, { useEffect, useState } from 'react';
import styles from './TodoList.module.css';

interface Todo {
    id: string;
    text: string;
    done: boolean;
}

export const TodoList: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodo, setNewTodo] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState('');

    useEffect(() => {
        if (open) {
            chrome.storage.local.get(['todos'], res => {
                if (Array.isArray(res.todos)) setTodos(res.todos);
            });
        }
    }, [open]);

    useEffect(() => {
        if (open) chrome.storage.local.set({ todos });
    }, [todos, open]);

    const addTodo = () => {
        if (newTodo.trim()) {
            setTodos([...todos, { id: Date.now().toString(), text: newTodo.trim(), done: false }]);
            setNewTodo('');
        }
    };

    const deleteTodo = (id: string) => {
        setTodos(todos.filter(t => t.id !== id));
    };

    const toggleDone = (id: string) => {
        setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    const startEdit = (id: string, text: string) => {
        setEditingId(id);
        setEditingText(text);
    };

    const saveEdit = (id: string) => {
        setTodos(todos.map(t => t.id === id ? { ...t, text: editingText } : t));
        setEditingId(null);
        setEditingText('');
    };

    if (!open) return null;
    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ minWidth: 260, position: 'fixed', left: 24, bottom: 80, padding: '2em 1.5em 1.5em 1.5em' }}>
                <h2 className={styles.heading}>Tasks</h2>
                <ul className={styles.form} style={{ marginBottom: '1em', padding: 0 }}>
                    {todos.map(todo => (
                        <li key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: '0.3em'}}>
                            <input type="checkbox" checked={todo.done} onChange={() => toggleDone(todo.id)} style={{ accentColor: '#2563eb', width: '1.2em', height: '1.2em' }} />
                            {editingId === todo.id ? (
                                <input
                                    className={styles.input}
                                    value={editingText}
                                    autoFocus
                                    onChange={e => setEditingText(e.target.value)}
                                    onBlur={() => saveEdit(todo.id)}
                                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(todo.id); }}
                                    style={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}
                                />
                            ) : (
                                <span
                                    className={todo.done ? `${styles.todoText} ${styles.saveBtn}` : styles.todoText}
                                    style={{ textDecoration: todo.done ? 'line-through' : 'none', color: todo.done ? '#888' : '#f3f4f6', background: 'none', border: 'none', cursor: 'pointer', minWidth: 0, wordBreak: 'break-word' }}
                                    onDoubleClick={() => startEdit(todo.id, todo.text)}
                                >{todo.text}</span>
                            )}
                            <button onClick={() => deleteTodo(todo.id)} title="Delete" className={styles.deleteBtn} style={{marginLeft:'8px'}}>x</button>
                        </li>
                    ))}
                </ul>
                <input
                    className={styles.input}
                    value={newTodo}
                    onChange={e => setNewTodo(e.target.value)}
                    placeholder="Add a new task..."
                    onKeyDown={e => { if (e.key === 'Enter') addTodo(); }}
                    style={{ marginBottom: '0.5em', width: '100%', boxSizing: 'border-box' }}
                />
                <button onClick={onClose} className={styles.closeBtn} title="Close" style={{ position: 'absolute', top: 8, right: 8 }}>×</button>
            </div>
        </div>
    );
};
