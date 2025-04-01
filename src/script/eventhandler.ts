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
const postContainer = document.getElementById('postContainer') as HTMLDivElement;
const searchInput = document.getElementById('searchInput') as HTMLInputElement; // Search input field

let editingPostId: number | null = null;
let allPosts: Post[] = [];  // Holds both local and fetched posts
let postsToShow: Post[] = [];
let isFetching = false;
let hasMore = true;

// Load posts from localStorage or fetch from API
const loadPosts = async () => {
    if (isFetching || !hasMore) return;
    isFetching = true;

    const posts = await fetchPosts();
    if (posts.length < 30) hasMore = false;

    // Append the fetched posts to allPosts (it now includes both local and fetched posts)
    allPosts = [...allPosts, ...posts];
    postsToShow = [...postsToShow, ...posts];
    storePostsLocally(allPosts);
    displayPosts(postsToShow);

    isFetching = false;
};

// Validation function to check if inputs are valid
const validateInputs = (): boolean => {
    let isValid = true;

    // Clear previous error messages
    clearErrorMessages();

    // Title validation
    if (!titleInput.value.trim()) {
        showErrorMessage(titleInput, 'Title is required.');
        isValid = false;
    }

    // Body validation
    if (!bodyInput.value.trim()) {
        showErrorMessage(bodyInput, 'Description is required.');
        isValid = false;
    }

    return isValid;
};

// Show error message next to the input field
const showErrorMessage = (inputElement: HTMLInputElement, message: string) => {
    const errorElement = document.createElement('span');
    errorElement.className = 'error-message';  // You can style this class in your CSS
    errorElement.textContent = message;

    // Insert error message right after the input field
    inputElement.insertAdjacentElement('afterend', errorElement);
};

// Clear all error messages
const clearErrorMessages = () => {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach((error) => error.remove());
};

// Add or update post
const addOrUpdatePost = async () => {
    if (!validateInputs()) return; // If inputs are invalid, do not proceed

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

    // Always store local posts and update allPosts array
    allPosts = getLocalPosts();  // Update allPosts to reflect any local changes
    titleInput.value = '';
    bodyInput.value = '';
    displayPosts(allPosts);  // Display the posts from allPosts (both local and fetched)
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
        deleteLocalPost(Number(postId));
        await deletePostAPI(Number(postId));
        allPosts = getLocalPosts();  // Ensure allPosts is updated after deletion
        displayPosts(allPosts);  // Display the updated list
    }
});

// Search function to filter posts
const searchPosts = () => {
    const query = searchInput.value.toLowerCase().trim();
    if (query) {
        // Filter through both local and fetched posts
        const filteredPosts = allPosts.filter(
            (post) =>
                post.title.toLowerCase().includes(query) ||
                post.body.toLowerCase().includes(query)
        );
        displayPosts(filteredPosts);
    } else {
        // If no query, show all posts
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
        allPosts = localPosts;  // Initialize allPosts with local posts
        displayPosts(localPosts);
    } else {
        loadPosts();
    }
};

saveButton.addEventListener('click', addOrUpdatePost);
