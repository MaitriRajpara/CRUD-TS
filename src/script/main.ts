import './eventhandler.ts';
import { deletePostAPI} from './api.js';
import { getLocalPosts, deleteLocalPost } from './storage.js';
import { displayPosts } from './ui.js';

const titleInput = document.getElementById('title') as HTMLInputElement;
const bodyInput = document.getElementById('body') as HTMLInputElement;
const postContainer = document.getElementById(
    'postContainer'
) as HTMLDivElement;

let editingPostId: number | null = null;
postContainer.addEventListener('click', async (event) => {
    const target = event.target as HTMLElement;
    const postId = target.getAttribute('data-id');
    if (!postId) return;

    if (target.classList.contains('edit-btn')) {
        const post = getLocalPosts().find((p) => p.id === Number(postId));
        if (post) {
            editingPostId = post.id;
            titleInput.value = post.title;
            bodyInput.value = post.body;
        }
    }

    if (target.classList.contains('delete-btn')) {
        const confirmDelete = window.confirm(
            'Are you sure you want to delete this post?'
        );
        if (confirmDelete) {
            deleteLocalPost(Number(postId));
            await deletePostAPI(Number(postId));
            displayPosts(getLocalPosts());
        }
    }
});
