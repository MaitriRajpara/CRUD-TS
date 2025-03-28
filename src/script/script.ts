const API_URL = 'https://dummyjson.com/posts';
const LIMIT = 30;
let skip = 0;
let hasMore = true;
let isFetching = false;

interface Post {
    id: number;
    title: string;
    body: string;
}

const postContainer = document.getElementById(
    'postContainer'
) as HTMLDivElement;
const titleInput = document.getElementById('title') as HTMLInputElement;
const bodyInput = document.getElementById('body') as HTMLInputElement;
const searchInput = document.getElementById('search') as HTMLInputElement;
const saveButton = document.getElementById('savePost') as HTMLButtonElement;

let editingPostId: number | null = null;

const fetchPosts = async () => {
    if (!hasMore || isFetching) return;
    isFetching = true;
    const response = await fetch(`${API_URL}?limit=${LIMIT}&skip=${skip}`);
    const data = await response.json();
    if (data.posts.length < LIMIT) hasMore = false;
    storePostsLocally(data.posts);
    displayPosts();
    skip += LIMIT;
    isFetching = false;
};

const storePostsLocally = (posts: Post[]) => {
    const storedPosts = getLocalPosts();
    const newPosts = posts.filter(
        (p) => !storedPosts.some((sp) => sp.id === p.id)
    );
    localStorage.setItem(
        'posts',
        JSON.stringify([...storedPosts, ...newPosts])
    );
};

const getLocalPosts = (): Post[] => {
    return JSON.parse(localStorage.getItem('posts') || '[]');
};

const displayPosts = () => {
    const posts = getLocalPosts();
    postContainer.innerHTML = '';
    posts.forEach((post) => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.setAttribute('data-id', post.id.toString());
        postElement.innerHTML = `
          <h3>${post.title}</h3>
          <p>${post.body}</p>
          <div class="post-btn">
          <button class="edit-btn" onclick="editPost(${post.id})">Edit</button>
          <button class="delete-btn" onclick="deletePost(${post.id})">Delete</button>
          </div>
      `;
        postContainer.appendChild(postElement);
    });
};

const addOrUpdatePost = async () => {
    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();
    if (!title || !body) return alert('Please enter title and description');

    let postData: Post;
    let posts = getLocalPosts();

    if (editingPostId) {
        postData = { id: editingPostId, title, body };
        posts = posts.map((p) => (p.id === editingPostId ? postData : p));
        await fetch(`${API_URL}/${editingPostId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        });
        editingPostId = null;
    } else {
        postData = { id: Date.now(), title, body };
        posts = [postData, ...posts];
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        });
    }

    localStorage.setItem('posts', JSON.stringify(posts));
    titleInput.value = '';
    bodyInput.value = '';
    displayPosts();
};

(window as any).editPost = (id: number) => {
    const post = getLocalPosts().find((p) => p.id === id);
    if (post) {
        editingPostId = id;
        titleInput.value = post.title;
        bodyInput.value = post.body;
    }
};

(window as any).deletePost = async (id: number) => {
    let posts = getLocalPosts().filter((p) => p.id !== id);
    localStorage.setItem('posts', JSON.stringify(posts));
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    displayPosts();
};

const searchPosts = async () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return displayPosts();
    const filteredPosts = getLocalPosts().filter(
        (p) =>
            p.title.toLowerCase().includes(query) ||
            p.body.toLowerCase().includes(query)
    );
    postContainer.innerHTML = '';
    filteredPosts.forEach((post) => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.setAttribute('data-id', post.id.toString());
        postElement.innerHTML = `
          <h3>${post.title}</h3>
          <p>${post.body}</p>
          <div class="post-btn">
          <button class="edit-btn" onclick="editPost(${post.id})">Edit</button>
          <button class="delete-btn" onclick="deletePost(${post.id})">Delete</button>
          </div>
      `;
        postContainer.appendChild(postElement);
    });
};

const handleScroll = () => {
    if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 100
    ) {
        fetchPosts();
    }
};

window.onload = () => {
    const localPosts = getLocalPosts();
    if (localPosts.length > 0) {
        displayPosts();
    } else {
        fetchPosts();
    }
};

saveButton.addEventListener('click', addOrUpdatePost);
searchInput.addEventListener('input', searchPosts);
window.addEventListener('scroll', handleScroll);
