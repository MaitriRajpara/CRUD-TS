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
const searchInput = document.getElementById('searchInput') as HTMLInputElement;

let editingPostId: number | null = null;
let allPosts: Post[] = [];
let postsToShow: Post[] = [];
let isFetching = false;
let hasMore = true;

// Load posts from localStorage or fetch from API
const loadPosts = async () => {
    if (isFetching || !hasMore) return;
    isFetching = true;

    const posts = await fetchPosts();
    if (posts.length < 30) hasMore = false;

    allPosts = [...allPosts, ...posts];
    postsToShow = [...postsToShow, ...posts];
    storePostsLocally(allPosts);
    displayPosts(postsToShow);

    isFetching = false;
};

// Validation function to check if inputs are valid
const validateInputs = (): boolean => {
    let isValid = true;

    clearErrorMessages();

    if (!titleInput.value.trim()) {
        showErrorMessage(titleInput, 'Title is required.');
        isValid = false;
    }

    if (!bodyInput.value.trim()) {
        showErrorMessage(bodyInput, 'Description is required.');
        isValid = false;
    }

    return isValid;
};

// Show error message next to the input field
const showErrorMessage = (inputElement: HTMLInputElement, message: string) => {
    const errorElement = document.createElement('span');
    errorElement.className = 'error-message';
    errorElement.textContent = message;

    inputElement.insertAdjacentElement('afterend', errorElement);
};

// Clear all error messages
const clearErrorMessages = () => {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach((error) => error.remove());
};

// Add or update post
const addOrUpdatePost = async () => {
    if (!validateInputs()) return;

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();
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

    allPosts = getLocalPosts();
    titleInput.value = '';
    bodyInput.value = '';
    displayPosts(allPosts);
};

// Event listener for Edit & Delete actions
postContainer.addEventListener('click', async (event) => {
    const target = event.target as HTMLElement;
    const postId = target.getAttribute('data-id');
    if (!postId) return;

    if (target.classList.contains('edit-btn')) {
        const post = allPosts.find((p) => p.id === Number(postId));
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
            allPosts = getLocalPosts(); 
            displayPosts(allPosts); 
            alert('Post has been successfully deleted.');
        }
    }
});

// Search function to filter posts
const searchPosts = () => {
    const query = searchInput.value.toLowerCase().trim();
    if (query) {
        const filteredPosts = allPosts.filter(
            (post) =>
                post.title.toLowerCase().includes(query) ||
                post.body.toLowerCase().includes(query)
        );
        displayPosts(filteredPosts);
    } else {
        displayPosts(allPosts);
    }
};

// Event listener for search input
searchInput.addEventListener('input', searchPosts);

// Infinite scroll logic
const handleScroll = () => {
    const scrollPosition = window.scrollY + window.innerHeight;
    const bottomPosition = document.documentElement.scrollHeight;

    if (scrollPosition >= bottomPosition - 100) {
        loadPosts();
    }
};

// Event listener for scroll event
window.addEventListener('scroll', handleScroll);

// Initial load of posts
window.onload = () => {
    const localPosts = getLocalPosts();
    if (localPosts.length > 0) {
        allPosts = localPosts;
        displayPosts(localPosts);
    } else {
        loadPosts();
    }
};

saveButton.addEventListener('click', addOrUpdatePost);
