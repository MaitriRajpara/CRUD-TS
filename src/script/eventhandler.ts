import { fetchPosts, updatePostAPI, deletePostAPI, Post } from './api.js';
import {
    getLocalPosts,
    storePostsLocally,
    updateLocalPost,
    deleteLocalPost,
} from './storage.js';
import { displayPosts } from './ui.js';

const titleInput = document.getElementById('title') as HTMLInputElement;
const bodyInput = document.getElementById('body') as HTMLInputElement;
const saveButton = document.getElementById('savePost') as HTMLButtonElement;
const postContainer = document.getElementById(
    'postContainer'
) as HTMLDivElement;

let editingPostId: number | null = null;

const loadPosts = async () => {
    const localPosts = getLocalPosts();
    if (localPosts.length > 0) {
        displayPosts(localPosts);
    } else {
        const posts = await fetchPosts();
        storePostsLocally(posts);
        displayPosts(posts);
    }
};

const addOrUpdatePost = async () => {
    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();
    if (!title || !body) return alert('Please enter title and description');

    let posts = getLocalPosts();
    let postData: Post;

    if (editingPostId) {
        postData = { id: editingPostId, title, body };
        updateLocalPost(postData);
        await updatePostAPI(postData);
        editingPostId = null;
    } else {
        postData = { id: Date.now(), title, body };
        posts = [postData, ...posts];
        storePostsLocally(posts);
    }

    titleInput.value = '';
    bodyInput.value = '';
    displayPosts(getLocalPosts());
};

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
        deleteLocalPost(Number(postId));
        await deletePostAPI(Number(postId));
        displayPosts(getLocalPosts());
    }
});

window.onload = loadPosts;
saveButton.addEventListener('click', addOrUpdatePost);
