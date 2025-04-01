import { Post } from './api.js';

// Get posts from localStorage
export const getLocalPosts = (): Post[] => {
    const storedPosts = localStorage.getItem('posts');
    return storedPosts ? JSON.parse(storedPosts) : [];
};

// Store posts in localStorage
export const storePostsLocally = (posts: Post[]) => {
    const storedPosts = getLocalPosts(); 
    const newPosts = posts.filter(
        (p) => !storedPosts.some((sp) => sp.id === p.id) 
    );
    const updatedPosts = [...storedPosts, ...newPosts]; 
    localStorage.setItem('posts', JSON.stringify(updatedPosts)); 
};

// Update post in localStorage
export const updateLocalPost = (updatedPost: Post) => {
    const posts = getLocalPosts();
    const updatedPosts = posts.map((p) => (p.id === updatedPost.id ? updatedPost : p));
    localStorage.setItem('posts', JSON.stringify(updatedPosts));
};

// Delete post from localStorage
export const deleteLocalPost = (id: number) => {
    const posts = getLocalPosts();
    const updatedPosts = posts.filter((p) => p.id !== id);
    localStorage.setItem('posts', JSON.stringify(updatedPosts)); 
};
