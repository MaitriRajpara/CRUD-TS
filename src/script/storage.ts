import { Post } from './api.js';

export const getLocalPosts = (): Post[] => {
    return JSON.parse(localStorage.getItem('posts') || '[]');
};

export const storePostsLocally = (posts: Post[]) => {
    const storedPosts = getLocalPosts();
    const newPosts = posts.filter((p) => !storedPosts.some((sp) => sp.id === p.id));
    localStorage.setItem('posts', JSON.stringify([...storedPosts, ...newPosts]));
};

export const updateLocalPost = (updatedPost: Post) => {
    const posts = getLocalPosts().map((p) => (p.id === updatedPost.id ? updatedPost : p));
    localStorage.setItem('posts', JSON.stringify(posts));
};

export const deleteLocalPost = (id: number) => {
    const posts = getLocalPosts().filter((p) => p.id !== id);
    localStorage.setItem('posts', JSON.stringify(posts));
};
